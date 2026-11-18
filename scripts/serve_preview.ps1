<#
  serve_preview.ps1 - BeanTelligence v6.0 Zero-Node Multi-Threaded Local HTTP Preview Server
  Uses inline C# (.NET TcpListener + ThreadPool per-socket dispatch + atomic FileShare.ReadWrite byte cache) on 127.0.0.1:8145.
  Zero Node.js, Python, or admin URLACL required. Resilient to Chromium speculative preconnect sockets, resets, and concurrent bursts.
  http://localhost:8145 is a Chromium Secure Context (Web Bluetooth, WakeLock, Clipboard, FileSystemFileHandle & SW enabled).

  Usage:
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\serve_preview.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\serve_preview.ps1 -Port 8145 -Watch
#>
param(
  [int]$Port = 8145,
  [string]$RootDir = '',
  [switch]$Watch,
  [int]$MaxRequests = 0
)
$ErrorActionPreference = 'Stop'
$workspaceRoot = Split-Path -Parent $PSScriptRoot
if (-not $RootDir) { $RootDir = $workspaceRoot }
$rootFull = [System.IO.Path]::GetFullPath($RootDir).TrimEnd('\', '/')
$buildScript = Join-Path $PSScriptRoot 'build_app.ps1'
$srcWatchDir = Join-Path $workspaceRoot 'src\v6'

if (-not ('BtPreviewServerV6' -as [type])) {
  Add-Type -Language CSharp -TypeDefinition @'
using System;
using System.Collections.Concurrent;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

public sealed class BtPreviewServerV6 : IDisposable {
  private sealed class CachedAsset {
    public long Ticks;
    public long Length;
    public byte[] Bytes;
  }

  private readonly string _rootTrimmed;
  private readonly string _rootWithSep;
  private readonly int _port;
  private readonly int _maxRequests;
  private readonly ConcurrentDictionary<string, CachedAsset> _cache =
    new ConcurrentDictionary<string, CachedAsset>(StringComparer.OrdinalIgnoreCase);
  private readonly ManualResetEventSlim _doneEvent = new ManualResetEventSlim(false);
  private TcpListener _listener;
  private Thread _acceptThread;
  private volatile bool _running;
  private int _servedCount;

  public int ServedCount { get { return _servedCount; } }
  public bool IsRunning { get { return _running; } }

  public BtPreviewServerV6(string rootDir, int port, int maxRequests) {
    _rootTrimmed = Path.GetFullPath(rootDir).TrimEnd('\\', '/');
    _rootWithSep = _rootTrimmed + Path.DirectorySeparatorChar;
    _port = port;
    _maxRequests = maxRequests;
  }

  public void Start() {
    if (_running) return;
    _listener = new TcpListener(IPAddress.Loopback, _port);
    _listener.Server.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, false);
    _listener.Start(128);
    _running = true;
    _acceptThread = new Thread(AcceptLoop);
    _acceptThread.IsBackground = true;
    _acceptThread.Name = "BtPreviewAcceptLoop";
    _acceptThread.Start();
  }

  public bool WaitDone(int millisecondsTimeout) {
    return _doneEvent.Wait(millisecondsTimeout);
  }

  public void Stop() {
    _running = false;
    try { if (_listener != null) _listener.Stop(); } catch { }
    _doneEvent.Set();
  }

  public void Dispose() {
    Stop();
    try { _doneEvent.Dispose(); } catch { }
  }

  private void AcceptLoop() {
    while (_running) {
      TcpClient client = null;
      try {
        client = _listener.AcceptTcpClient();
      } catch {
        if (!_running) break;
        Thread.Sleep(5);
        continue;
      }
      if (client != null) {
        try {
          if (!ThreadPool.QueueUserWorkItem(HandleClient, client)) {
            HandleClient(client);
          }
        } catch {
          try { client.Close(); } catch { }
        }
      }
    }
  }

  private void HandleClient(object state) {
    var client = state as TcpClient;
    if (client == null) return;
    try {
      client.NoDelay = true;
      client.ReceiveTimeout = 2500;
      client.SendTimeout = 5000;
      using (NetworkStream ns = client.GetStream()) {
        ns.ReadTimeout = 2500;
        ns.WriteTimeout = 5000;
        if (ProcessHttpExchange(ns)) {
          int done = Interlocked.Increment(ref _servedCount);
          if (_maxRequests > 0 && done >= _maxRequests) {
            _doneEvent.Set();
          }
        }
      }
    } catch {
      // Chromium speculative preconnect idle timeouts, client resets, and broken pipes are harmlessly ignored.
    } finally {
      try { client.Close(); } catch { }
    }
  }

  public bool ProcessHttpExchange(Stream stream) {
    string reqLine = ReadRequestHead(stream);
    if (string.IsNullOrEmpty(reqLine)) return false;

    string[] parts = reqLine.Split(' ');
    string method = parts.Length >= 1 ? parts[0].Trim().ToUpperInvariant() : "GET";
    string rawUrl = parts.Length >= 2 ? parts[1].Trim() : "/";

    int qIdx = rawUrl.IndexOf('?');
    string cleanPath = qIdx >= 0 ? rawUrl.Substring(0, qIdx) : rawUrl;
    int hIdx = cleanPath.IndexOf('#');
    if (hIdx >= 0) cleanPath = cleanPath.Substring(0, hIdx);
    try { cleanPath = Uri.UnescapeDataString(cleanPath); } catch { }
    if (string.IsNullOrEmpty(cleanPath) || cleanPath == "/") cleanPath = "/index.html";

    string rel = cleanPath.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar);
    string candidate;
    try {
      candidate = Path.GetFullPath(Path.Combine(_rootWithSep, rel));
    } catch {
      WriteResponse(stream, 400, "Bad Request", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("400 Bad Request"), method == "HEAD");
      return true;
    }

    if (!candidate.StartsWith(_rootWithSep, StringComparison.OrdinalIgnoreCase) &&
        !string.Equals(candidate, _rootTrimmed, StringComparison.OrdinalIgnoreCase)) {
      WriteResponse(stream, 403, "Forbidden", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("403 Forbidden"), method == "HEAD");
      return true;
    }

    if (method != "GET" && method != "HEAD") {
      WriteResponse(stream, 405, "Method Not Allowed", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("405 Method Not Allowed"), method == "HEAD");
      return true;
    }

    if (Directory.Exists(candidate)) {
      candidate = Path.Combine(candidate, "index.html");
    }

    byte[] body = TryReadAssetBytes(candidate);
    if (body == null) {
      WriteResponse(stream, 404, "Not Found", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("404 Not Found: " + cleanPath), method == "HEAD");
      return true;
    }

    string mime = GetMimeType(Path.GetExtension(candidate));
    WriteResponse(stream, 200, "OK", mime, body, method == "HEAD");
    return true;
  }

  private static string ReadRequestHead(Stream stream) {
    byte[] buf = new byte[8192];
    int total = 0;
    while (total < buf.Length) {
      int n = stream.Read(buf, total, buf.Length - total);
      if (n <= 0) break;
      total += n;
      if (HasHeaderTerminator(buf, total)) break;
    }
    if (total <= 0) return null;
    int eol = 0;
    while (eol < total && buf[eol] != (byte)'\r' && buf[eol] != (byte)'\n') eol++;
    if (eol <= 0) return null;
    return Encoding.ASCII.GetString(buf, 0, eol);
  }

  private static bool HasHeaderTerminator(byte[] buf, int len) {
    for (int i = 0; i + 1 < len; i++) {
      if (buf[i] == (byte)'\n' && buf[i + 1] == (byte)'\n') return true;
      if (i + 3 < len && buf[i] == (byte)'\r' && buf[i + 1] == (byte)'\n' &&
          buf[i + 2] == (byte)'\r' && buf[i + 3] == (byte)'\n') return true;
    }
    return false;
  }

  private byte[] TryReadAssetBytes(string fullPath) {
    for (int attempt = 0; attempt < 3; attempt++) {
      try {
        var fi = new FileInfo(fullPath);
        if (!fi.Exists) return null;
        long ticks = fi.LastWriteTimeUtc.Ticks;
        long len = fi.Length;
        CachedAsset cached;
        if (_cache.TryGetValue(fullPath, out cached) && cached != null &&
            cached.Ticks == ticks && cached.Length == len && cached.Bytes != null) {
          return cached.Bytes;
        }
        using (var fs = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete)) {
          int byteLen = (int)fs.Length;
          byte[] data = new byte[byteLen];
          int read = 0;
          while (read < byteLen) {
            int r = fs.Read(data, read, byteLen - read);
            if (r <= 0) break;
            read += r;
          }
          if (read != byteLen) {
            byte[] trimmed = new byte[read];
            Buffer.BlockCopy(data, 0, trimmed, 0, read);
            data = trimmed;
          }
          _cache[fullPath] = new CachedAsset { Ticks = ticks, Length = data.Length, Bytes = data };
          return data;
        }
      } catch (IOException) {
        Thread.Sleep(15);
      } catch {
        return null;
      }
    }
    return null;
  }

  private static void WriteResponse(Stream stream, int code, string statusText, string mime, byte[] body, bool headOnly) {
    int len = body != null ? body.Length : 0;
    string hdr = "HTTP/1.1 " + code + " " + statusText + "\r\n" +
      "Content-Type: " + mime + "\r\n" +
      "Content-Length: " + len + "\r\n" +
      "Cache-Control: no-store, no-cache, must-revalidate\r\n" +
      "X-Content-Type-Options: nosniff\r\n" +
      "Connection: close\r\n\r\n";
    byte[] hdrBytes = Encoding.ASCII.GetBytes(hdr);
    stream.Write(hdrBytes, 0, hdrBytes.Length);
    if (!headOnly && len > 0) {
      stream.Write(body, 0, len);
    }
    stream.Flush();
  }

  public static string GetMimeType(string ext) {
    switch ((ext ?? "").ToLowerInvariant()) {
      case ".html":
      case ".htm":         return "text/html; charset=utf-8";
      case ".webmanifest": return "application/manifest+json; charset=utf-8";
      case ".json":        return "application/json; charset=utf-8";
      case ".js":
      case ".mjs":         return "text/javascript; charset=utf-8";
      case ".css":         return "text/css; charset=utf-8";
      case ".svg":         return "image/svg+xml";
      case ".png":         return "image/png";
      case ".jpg":
      case ".jpeg":        return "image/jpeg";
      case ".webp":        return "image/webp";
      case ".ico":         return "image/x-icon";
      case ".woff2":       return "font/woff2";
      case ".csv":         return "text/csv; charset=utf-8";
      case ".txt":
      case ".btbackup":    return "text/plain; charset=utf-8";
      default:             return "application/octet-stream";
    }
  }
}
'@
}

$watcher = $null
$script:NeedsRebuild = $false
$script:LastChangeUtc = [DateTime]::MinValue

if ($Watch -and (Test-Path -LiteralPath $srcWatchDir)) {
  $watcher = New-Object System.IO.FileSystemWatcher($srcWatchDir)
  $watcher.IncludeSubdirectories = $true
  $watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, Size'
  $watcher.EnableRaisingEvents = $true
  $onFsEvent = {
    $script:NeedsRebuild = $true
    $script:LastChangeUtc = [DateTime]::UtcNow
  }
  Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $onFsEvent | Out-Null
  Register-ObjectEvent -InputObject $watcher -EventName Created -Action $onFsEvent | Out-Null
  Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $onFsEvent | Out-Null
}

$server = New-Object BtPreviewServerV6($rootFull, $Port, $MaxRequests)
try {
  $server.Start()
  Write-Output ("BeanTelligence v6 Preview Server listening at http://localhost:" + $Port + "/ (Root: " + $rootFull + $(if ($Watch) { ', Watch: ON' } else { '' }) + ")")
  while (-not $server.WaitDone(60)) {
    if ($Watch -and $script:NeedsRebuild -and (([DateTime]::UtcNow - $script:LastChangeUtc).TotalMilliseconds -ge 100)) {
      $script:NeedsRebuild = $false
      try {
        & powershell -NoProfile -ExecutionPolicy Bypass -File $buildScript | Write-Host -ForegroundColor Cyan
      } catch {
        Write-Warning ("Incremental rebuild error: " + $_.Exception.Message)
      }
    }
  }
} finally {
  $server.Dispose()
  if ($watcher) { $watcher.Dispose() }
}
