<#
  build_app.ps1 - BeanTelligence v6.0 Deterministic Zero-Node Assembler
  Compatible with Windows PowerShell 5.1 + .NET 4.8 C# (zero Node.js / npm / Python required).

  Usage:
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\build_app.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\build_app.ps1 -OutputPath scratch\test_v6_build.html
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\build_app.ps1 -EmitCapacitorWww
#>
param(
  [string]$ManifestPath = '',
  [Alias('OutFile')]
  [string]$OutputPath = '',
  [switch]$EmitCapacitorWww,
  [string]$WwwDir = '',
  [switch]$AllowMissingStubs,
  [switch]$SkipSyntaxCheck
)
$ErrorActionPreference = 'Stop'
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$root = Split-Path -Parent $PSScriptRoot
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if (-not $ManifestPath) { $ManifestPath = Join-Path $root 'src\v6\manifest.build.json' }
if (-not (Test-Path -LiteralPath $ManifestPath)) { throw "Build manifest not found: $ManifestPath" }

$manifestDir = Split-Path -Parent ([System.IO.Path]::GetFullPath($ManifestPath))
$manifestJson = [System.IO.File]::ReadAllText($ManifestPath, [System.Text.Encoding]::UTF8)
$manifest = $manifestJson | ConvertFrom-Json

if (-not $OutputPath) {
  $defOut = if ($manifest.defaultOutput) { [string]$manifest.defaultOutput } else { 'index.html' }
  $OutputPath = Join-Path $root $defOut
}
if (-not $WwwDir) {
  $defWww = if ($manifest.capacitorWww -and $manifest.capacitorWww.webDir) { ([string]$manifest.capacitorWww.webDir).Replace('/', '\') } else { 'mobile\www' }
  $WwwDir = Join-Path $root $defWww
}

if (-not $SkipSyntaxCheck -and -not ('BtJsSyntaxChecker' -as [type])) {
  Add-Type -Language CSharp -TypeDefinition @'
using System;
using System.Collections.Generic;

public static class BtJsSyntaxChecker {
  private class OpenTok {
    public char Ch;
    public int Line;
    public int Col;
    public bool IsTemplateExpr;
    public Dictionary<string, string> Decls = new Dictionary<string, string>();
  }

  private static bool CanStartRegex(char prevNonWs, string prevWord) {
    if (prevNonWs == '\0') return true;
    if ("([{:;,=!?&|+-*%^~<>".IndexOf(prevNonWs) >= 0) return true;
    if (prevWord == "return" || prevWord == "typeof" || prevWord == "instanceof" ||
        prevWord == "in" || prevWord == "of" || prevWord == "void" ||
        prevWord == "delete" || prevWord == "throw" || prevWord == "new" ||
        prevWord == "case" || prevWord == "yield" || prevWord == "await" ||
        prevWord == "else") {
      return true;
    }
    return false;
  }

  public static string CheckBalance(string code) {
    var stack = new Stack<OpenTok>();
    var rootDecls = new Dictionary<string, string>();
    int line = 1, col = 0;
    char prevNonWs = '\0';
    string prevWord = "";
    string pendingDeclKw = "";
    int n = code.Length;

    for (int i = 0; i < n; i++) {
      char c = code[i];
      if (c == '\n') { line++; col = 0; continue; }
      col++;
      if (char.IsWhiteSpace(c)) continue;

      if (c == '/' && i + 1 < n && code[i + 1] == '/') {
        i += 2;
        while (i < n && code[i] != '\n') i++;
        i--;
        continue;
      }
      if (c == '/' && i + 1 < n && code[i + 1] == '*') {
        int startLine = line;
        i += 2;
        bool closed = false;
        while (i < n) {
          if (code[i] == '\n') { line++; col = 0; }
          if (code[i] == '*' && i + 1 < n && code[i + 1] == '/') { i++; closed = true; break; }
          i++;
        }
        if (!closed) return "Unclosed /* comment starting at line " + startLine;
        continue;
      }
      if (c == '\'' || c == '"') {
        char quote = c;
        int startLine = line;
        i++;
        bool closed = false;
        while (i < n) {
          char sc = code[i];
          if (sc == '\\') {
            if (i + 2 < n && code[i + 1] == '\r' && code[i + 2] == '\n') { line++; col = 0; i += 3; continue; }
            if (i + 1 < n && code[i + 1] == '\n') { line++; col = 0; }
            i += 2;
            continue;
          }
          if (sc == '\n') return "Unescaped newline in string starting at line " + startLine;
          if (sc == quote) { closed = true; break; }
          i++;
        }
        if (!closed) return "Unclosed string starting at line " + startLine;
        prevNonWs = quote; prevWord = ""; pendingDeclKw = "";
        continue;
      }
      if (c == '`') {
        int startLine = line;
        i++;
        bool closed = false;
        while (i < n) {
          char tc = code[i];
          if (tc == '\\') { if (i + 1 < n && code[i + 1] == '\n') line++; i += 2; continue; }
          if (tc == '\n') line++;
          if (tc == '`') { closed = true; break; }
          if (tc == '$' && i + 1 < n && code[i + 1] == '{') {
            stack.Push(new OpenTok { Ch = '{', Line = line, Col = col, IsTemplateExpr = true });
            i++;
            closed = true;
            prevNonWs = '{'; prevWord = ""; pendingDeclKw = "";
            goto NextChar;
          }
          i++;
        }
        if (!closed) return "Unclosed template literal starting at line " + startLine;
        prevNonWs = '`'; prevWord = ""; pendingDeclKw = "";
        continue;
      }
      if (c == '/' && CanStartRegex(prevNonWs, prevWord)) {
        int j = i + 1;
        bool inClass = false, closed = false;
        while (j < n) {
          char rc = code[j];
          if (rc == '\\') { j += 2; continue; }
          if (rc == '\n' || rc == '\r') break;
          if (rc == '[') inClass = true;
          else if (rc == ']') inClass = false;
          else if (rc == '/' && !inClass) { closed = true; break; }
          j++;
        }
        if (closed && j > i + 1) {
          i = j;
          while (i + 1 < n && char.IsLetter(code[i + 1])) i++;
          prevNonWs = '/'; prevWord = ""; pendingDeclKw = "";
          continue;
        }
      }

      if (char.IsLetter(c) || c == '_' || c == '$') {
        int start = i;
        while (i + 1 < n && (char.IsLetterOrDigit(code[i + 1]) || code[i + 1] == '_' || code[i + 1] == '$')) i++;
        string word = code.Substring(start, i - start + 1);
        if (!string.IsNullOrEmpty(pendingDeclKw)) {
          var curDecls = stack.Count > 0 ? stack.Peek().Decls : rootDecls;
          if (curDecls.ContainsKey(word)) {
            string prevInfo = curDecls[word];
            string prevKw = prevInfo.Split('@')[0];
            if (pendingDeclKw == "const" || pendingDeclKw == "let" || pendingDeclKw == "class" ||
                prevKw == "const" || prevKw == "let" || prevKw == "class") {
              return "Duplicate lexical identifier '" + word + "' (" + pendingDeclKw + "@L" + line + " collides with " + prevInfo + ")";
            }
          } else {
            curDecls[word] = pendingDeclKw + "@L" + line;
          }
          pendingDeclKw = "";
        } else if (prevNonWs != '.') {
          if (word == "const" || word == "let" || word == "var") {
            pendingDeclKw = word;
          } else if ((word == "function" || word == "class") &&
                     (prevWord == "async" || prevNonWs == '\0' || prevNonWs == ';' || prevNonWs == '{' || prevNonWs == '}' || prevNonWs == ')')) {
            pendingDeclKw = word;
          }
        }
        prevWord = word;
        prevNonWs = code[i];
        continue;
      }

      pendingDeclKw = "";
      if (c == '{' || c == '(' || c == '[') {
        stack.Push(new OpenTok { Ch = c, Line = line, Col = col, IsTemplateExpr = false });
      } else if (c == '}' || c == ')' || c == ']') {
        if (stack.Count == 0) return "Unexpected '" + c + "' at line " + line + ":" + col;
        var top = stack.Pop();
        char expected = top.Ch == '{' ? '}' : top.Ch == '(' ? ')' : ']';
        if (c != expected) return "Mismatched '" + c + "' at line " + line + ":" + col + " (expected '" + expected + "' for '" + top.Ch + "' from line " + top.Line + ")";
        if (c == '}' && top.IsTemplateExpr) {
          int startLine = line;
          i++;
          bool closed = false;
          while (i < n) {
            char tc = code[i];
            if (tc == '\\') { if (i + 1 < n && code[i + 1] == '\n') line++; i += 2; continue; }
            if (tc == '\n') line++;
            if (tc == '`') { closed = true; break; }
            if (tc == '$' && i + 1 < n && code[i + 1] == '{') {
              stack.Push(new OpenTok { Ch = '{', Line = line, Col = col, IsTemplateExpr = true });
              i++;
              closed = true;
              prevNonWs = '{'; prevWord = ""; pendingDeclKw = "";
              goto NextChar;
            }
            i++;
          }
          if (!closed) return "Unclosed template continuation starting at line " + startLine;
          prevNonWs = '`'; prevWord = ""; pendingDeclKw = "";
          continue;
        }
      }

      prevNonWs = c;
      prevWord = "";
      NextChar:;
    }

    if (stack.Count > 0) {
      var top = stack.Peek();
      return "Unclosed '" + top.Ch + "' opened at line " + top.Line + ":" + top.Col + " (remaining depth: " + stack.Count + ")";
    }
    return "OK";
  }
}
'@
}

$modules = @($manifest.modules | Sort-Object { [int]$_.order })
if ($modules.Count -eq 0) { throw "Manifest contains zero modules: $ManifestPath" }

$rxEmoji = [regex]::new('([\u2600-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF]|\uFE0F)')
$assembledSb = New-Object System.Text.StringBuilder (2097152)
$bundleMap = @{
  'styles'   = New-Object System.Text.StringBuilder (262144)
  'core'     = New-Object System.Text.StringBuilder (524288)
  'platform' = New-Object System.Text.StringBuilder (262144)
  'ui'       = New-Object System.Text.StringBuilder (1048576)
  'headHtml' = ''
  'shellHtml'= ''
}

foreach ($m in $modules) {
  $relPath = ([string]$m.path).Replace('/', '\')
  $fullPath = Join-Path $manifestDir $relPath
  $content = ''

  if (-not (Test-Path -LiteralPath $fullPath)) {
    if (-not $AllowMissingStubs) {
      throw "Missing required v6 module [order $($m.order)]: $fullPath (owner: $($m.owner))"
    }
    if ($m.path -eq 'html/0010-head.html') {
      $content = "<!doctype html>`n<html lang=`"en`" data-theme=`"light`" data-science-lens=`"surface`">`n<head><meta charset=`"utf-8`"><title>BeanTelligence v6 Stub</title>`n<style>`n"
    } elseif ($m.path -eq 'html/0100-shell.html') {
      $content = "</style>`n</head>`n<body><div id=`"app-shell`"><main id=`"mount`"></main><div id=`"sheet`"></div></div>`n<script>`n"
    } elseif ($m.path -eq 'ui/00-iife-open.js') {
      $content = "(function(){`n'use strict';`n"
    } elseif ($m.path -eq 'ui/99-boot-close.js') {
      $content = "})();`n</script>`n</body>`n</html>`n"
    } else {
      $stMark = if ($m.startMarker) { "$($m.startMarker)`n" } else { '' }
      $enMark = if ($m.endMarker) { "`n$($m.endMarker)" } else { '' }
      $content = "${stMark}/* stub: $($m.path) */${enMark}`n"
    }
  } else {
    $rawBytes = [System.IO.File]::ReadAllBytes($fullPath)
    if ($rawBytes.Length -ge 3 -and $rawBytes[0] -eq 0xEF -and $rawBytes[1] -eq 0xBB -and $rawBytes[2] -eq 0xBF) {
      $cleanBytes = New-Object byte[] ($rawBytes.Length - 3)
      [System.Buffer]::BlockCopy($rawBytes, 3, $cleanBytes, 0, $cleanBytes.Length)
      Write-Warning "Ignored UTF-8 BOM in $($m.path) during assembly (source file untouched)"
      $rawBytes = $cleanBytes
    }
    $content = $utf8NoBom.GetString($rawBytes)
  }

  if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) {
    $content += "`n"
  }

  if ($m.startMarker -and -not $content.TrimStart().StartsWith([string]$m.startMarker)) {
    throw "Module $($m.path) must start with marker $($m.startMarker)"
  }
  if ($m.endMarker -and -not $content.TrimEnd().EndsWith([string]$m.endMarker)) {
    throw "Module $($m.path) must end with marker $($m.endMarker)"
  }

  $emMatch = $rxEmoji.Match($content)
  if ($emMatch.Success) {
    $cp = [int][char]$emMatch.Value[0]
    throw ("Banned Unicode emoji/pictograph (U+" + $cp.ToString('X4') + ") detected in " + $m.path)
  }

  if (-not $SkipSyntaxCheck -and $m.kind -eq 'js' -and $m.balanced -eq $true -and $content.Length -gt 0) {
    $bal = [BtJsSyntaxChecker]::CheckBalance($content)
    if ($bal -ne 'OK') {
      throw "JS syntax/balance error in $($m.path): $bal"
    }
  }

  [void]$assembledSb.Append($content)

  if ($EmitCapacitorWww) {
    if ($m.path -eq 'html/0010-head.html') { $bundleMap['headHtml'] = $content }
    elseif ($m.path -eq 'html/0100-shell.html') { $bundleMap['shellHtml'] = $content }
    elseif ($m.bundle -and $bundleMap.ContainsKey([string]$m.bundle)) {
      if ($m.path -eq 'ui/99-boot-close.js') {
        $scriptCloseIdx = $content.LastIndexOf('</script>', [System.StringComparison]::OrdinalIgnoreCase)
        $jsTail = if ($scriptCloseIdx -ge 0) { $content.Substring(0, $scriptCloseIdx) } else { $content }
        [void]$bundleMap['ui'].Append($jsTail)
        if (-not $jsTail.EndsWith("`n")) { [void]$bundleMap['ui'].Append("`n") }
      } else {
        [void]$bundleMap[[string]$m.bundle].Append($content)
      }
    }
  }
}

$assembledHtml = $assembledSb.ToString()

if (-not $SkipSyntaxCheck) {
  $rxScriptOpen = [regex]::new('<script\b[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $rxScriptClose = [regex]::new('</script\s*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $scanPos = 0
  $scriptCount = 0
  while ($scanPos -lt $assembledHtml.Length) {
    $mOpen = $rxScriptOpen.Match($assembledHtml, $scanPos)
    if (-not $mOpen.Success) { break }
    $bodyStart = $mOpen.Index + $mOpen.Length
    $mClose = $rxScriptClose.Match($assembledHtml, $bodyStart)
    if (-not $mClose.Success) { throw "Unclosed <script> tag in assembled output" }
    $scriptBody = $assembledHtml.Substring($bodyStart, $mClose.Index - $bodyStart)
    $bal = [BtJsSyntaxChecker]::CheckBalance($scriptBody)
    if ($bal -ne 'OK') { throw "Assembled <script>[$scriptCount] lexical/balance error: $bal" }
    $scriptCount++
    $scanPos = $mClose.Index + $mClose.Length
  }
  if ($scriptCount -lt 1) { throw "Zero <script> blocks found in assembled HTML" }
}

$outFull = [System.IO.Path]::GetFullPath($OutputPath)
$outParent = Split-Path -Parent $outFull
if (-not (Test-Path -LiteralPath $outParent)) { New-Item -ItemType Directory -Path $outParent -Force | Out-Null }
$tmpOut = "$outFull.building"
[System.IO.File]::WriteAllText($tmpOut, $assembledHtml, $utf8NoBom)
Move-Item -LiteralPath $tmpOut -Destination $outFull -Force

$sha256 = (Get-FileHash -LiteralPath $outFull -Algorithm SHA256).Hash
$shortHash = $sha256.Substring(0, 12).ToLowerInvariant()
$byteLen = (Get-Item -LiteralPath $outFull).Length

if ($EmitCapacitorWww) {
  $wwwFull = [System.IO.Path]::GetFullPath($WwwDir)
  if (-not (Test-Path -LiteralPath $wwwFull)) { New-Item -ItemType Directory -Path $wwwFull -Force | Out-Null }
  [System.IO.File]::WriteAllText((Join-Path $wwwFull 'styles.css'), $bundleMap['styles'].ToString(), $utf8NoBom)
  [System.IO.File]::WriteAllText((Join-Path $wwwFull 'bt-core.js'), $bundleMap['core'].ToString(), $utf8NoBom)
  [System.IO.File]::WriteAllText((Join-Path $wwwFull 'bt-platform.js'), $bundleMap['platform'].ToString(), $utf8NoBom)
  [System.IO.File]::WriteAllText((Join-Path $wwwFull 'bt-ui.js'), $bundleMap['ui'].ToString(), $utf8NoBom)

  $wwwHead = $bundleMap['headHtml'] -replace '<style>\s*$', "<link rel=`"stylesheet`" href=`"./styles.css`">`n"
  $wwwShell = $bundleMap['shellHtml'] -replace '^\s*</style>', ''
  $wwwShell = $wwwShell -replace '<script>\s*$', "<script src=`"./bt-core.js`"></script>`n<script src=`"./bt-platform.js`"></script>`n<script src=`"./bt-ui.js`"></script>`n</body>`n</html>`n"
  [System.IO.File]::WriteAllText((Join-Path $wwwFull 'index.html'), ($wwwHead + $wwwShell), $utf8NoBom)

  foreach ($asset in @('manifest.webmanifest', 'sw.js')) {
    $srcAsset = Join-Path $root $asset
    if (Test-Path -LiteralPath $srcAsset) {
      $dstAsset = Join-Path $wwwFull $asset
      if ($asset -eq 'sw.js') {
        $swRaw = [System.IO.File]::ReadAllText($srcAsset, [System.Text.Encoding]::UTF8)
        if ($swRaw -notmatch 'bt-core\.js') {
          $swRaw = $swRaw -replace "'./manifest\.webmanifest',", "'./manifest.webmanifest',`n  './styles.css',`n  './bt-core.js',`n  './bt-platform.js',`n  './bt-ui.js',"
        }
        [System.IO.File]::WriteAllText($dstAsset, $swRaw, $utf8NoBom)
      } else {
        Copy-Item -LiteralPath $srcAsset -Destination $dstAsset -Force
      }
    }
  }
  $iconsSrc = Join-Path $root 'icons'
  if (Test-Path -LiteralPath $iconsSrc) {
    $iconsDst = Join-Path $wwwFull 'icons'
    if (-not (Test-Path -LiteralPath $iconsDst)) { New-Item -ItemType Directory -Path $iconsDst -Force | Out-Null }
    Copy-Item -Path (Join-Path $iconsSrc '*') -Destination $iconsDst -Recurse -Force
  }
  Write-Output "Emitted Capacitor www bundle at $wwwFull"
}

$sw.Stop()
Write-Output ("Built " + $outFull + " from " + $modules.Count + " modules in " + [Math]::Round($sw.Elapsed.TotalMilliseconds, 1) + " ms (" + $byteLen + " bytes, SHA256 " + $sha256 + ", rev " + $shortHash + ")")
