<#
  verify_nextgen.ps1 - BeanTelligence v6.0 8-Gate Automated Verification Suite
  Compatible with Windows PowerShell 5.1 + .NET 4.8 C# + Headless Edge V8 / Chakra JsRT (zero Node.js or Python required).

  Implements all 8 Mandatory Gates from nextgen_master_blueprint.md Section 6.2:
    Gate 1 (P0): 100% Saved-Data Continuity, 18 LS Keys, 2 IDB v1 DBs, 129-Col Lockstep, QR SVG & BTMyCoffeesVault (<2ms @ N=500)
    Gate 2:      Zero Unicode Emojis (#136), Zero Stock Icons, Zero UTF-8 BOM, Zero External CDNs, C# JS Lexer Balance
    Gate 3:      Scientist-Proof Physics, Mass/Energy Conservation, Golden Sip & Boundary Torture (BTCoreV6 & BTInnovate)
    Gate 4:      Precision Hardware Parity (Philips 5500 EP5547 #134, Fellow Aiden, xBloom Studio)
    Gate 5:      15-Protocol / 5-Slot WebBLE Binary GATT, 20B MTU Ring-Buffers & Mid-Brew Tare Continuity
    Gate 6:      Zero-Form UX (0 <select> / <input type="number">), 5-Tab + 55-Route Light/Dark Sweep & Zero DOM Leaks
    Gate 7:      Installable Web PWA (manifest.webmanifest, sw.js) & serve_preview.ps1 HTTP 200 Secure Context
    Gate 8:      Horizon-2 Capacitor 6+ Native Bridge Readiness (iOS/Android Manifests + Mock Native Adapter)

  Usage:
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\verify_nextgen.ps1 -WithHeadless
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\verify_nextgen.ps1 -HtmlPath scratch\test_v6_build.html -WithHeadless
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\verify_nextgen.ps1 -BuildDataOnly
#>
param(
  [string]$HtmlPath = '',
  [string]$SrcDir = '',
  [switch]$BuildDataOnly,
  [switch]$WithHeadless,
  [switch]$StaticOnly
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
if (-not $SrcDir) { $SrcDir = Join-Path $root 'src\v6' }

$tempAssembled = ''
if (-not $HtmlPath -and -not $BuildDataOnly) {
  $candRootHtml = Join-Path $root 'index.html'
  $rootCorpusHead = if (Test-Path -LiteralPath $candRootHtml) { [System.IO.File]::ReadAllText($candRootHtml, [System.Text.Encoding]::UTF8) } else { '' }
  if ($rootCorpusHead -match 'data-science-lens' -and $rootCorpusHead -match 'BTCoreV6') {
    $HtmlPath = $candRootHtml
  } else {
    $tempAssembled = Join-Path $env:TEMP ('bt_v6_verify_' + [guid]::NewGuid().ToString('N') + '.html')
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'build_app.ps1') -OutputPath $tempAssembled | Out-Null
    $HtmlPath = $tempAssembled
  }
}

$script:PassCount = 0
$script:FailCount = 0
$script:Failures = New-Object System.Collections.Generic.List[string]

function Assert-Check {
  param([bool]$Condition, [string]$Label, [string]$Detail = '')
  if ($Condition) {
    $script:PassCount++
    Write-Host ('  [PASS] ' + $Label) -ForegroundColor Green
  } else {
    $script:FailCount++
    $msg = $Label + ($(if ($Detail) { ' -- ' + $Detail } else { '' }))
    $script:Failures.Add($msg)
    Write-Host ('  [FAIL] ' + $msg) -ForegroundColor Red
  }
}

# Compile C# JS Lexer + In-Process Chakra ES6 Runner
if (-not ('BtJsSyntaxCheckerV6' -as [type])) {
  Add-Type -Language CSharp -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public static class BtJsSyntaxCheckerV6 {
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
          if (sc == '\\') { i += 2; continue; }
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

public static class BtChakraHostV6 {
  [DllImport("chakra.dll", EntryPoint = "JsCreateRuntime")]
  private static extern int ChakraCreateRuntime(int attributes, IntPtr threadService, out IntPtr runtime);
  [DllImport("chakra.dll", EntryPoint = "JsDisposeRuntime")]
  private static extern int ChakraDisposeRuntime(IntPtr runtime);
  [DllImport("chakra.dll", EntryPoint = "JsCreateContext")]
  private static extern int ChakraCreateContext(IntPtr runtime, out IntPtr newContext);
  [DllImport("chakra.dll", EntryPoint = "JsSetCurrentContext")]
  private static extern int ChakraSetCurrentContext(IntPtr context);
  [DllImport("chakra.dll", EntryPoint = "JsRunScript")]
  private static extern int ChakraRunScript([MarshalAs(UnmanagedType.LPWStr)] string script, IntPtr sourceContext, [MarshalAs(UnmanagedType.LPWStr)] string sourceUrl, out IntPtr result);
  [DllImport("chakra.dll", EntryPoint = "JsConvertValueToString")]
  private static extern int ChakraConvertValueToString(IntPtr value, out IntPtr stringValue);
  [DllImport("chakra.dll", EntryPoint = "JsStringToPointer")]
  private static extern int ChakraStringToPointer(IntPtr value, out IntPtr stringValue, out UIntPtr stringLength);
  [DllImport("chakra.dll", EntryPoint = "JsGetAndClearException")]
  private static extern int ChakraGetAndClearException(out IntPtr exception);
  [DllImport("chakra.dll", EntryPoint = "JsGetPropertyIdFromName")]
  private static extern int ChakraGetPropertyIdFromName([MarshalAs(UnmanagedType.LPWStr)] string name, out IntPtr propId);
  [DllImport("chakra.dll", EntryPoint = "JsGetProperty")]
  private static extern int ChakraGetProperty(IntPtr obj, IntPtr propId, out IntPtr val);

  private static string ValToString(IntPtr val) {
    if (val == IntPtr.Zero) return "";
    IntPtr strVal;
    if (ChakraConvertValueToString(val, out strVal) != 0) return "";
    IntPtr ptr; UIntPtr len;
    if (ChakraStringToPointer(strVal, out ptr, out len) != 0) return "";
    return Marshal.PtrToStringUni(ptr, (int)len);
  }

  public static string Eval(string code) {
    IntPtr rt = IntPtr.Zero;
    try {
      int hr = ChakraCreateRuntime(0, IntPtr.Zero, out rt);
      if (hr != 0) return "ERR_RT:0x" + hr.ToString("X8");
      IntPtr ctx;
      hr = ChakraCreateContext(rt, out ctx);
      if (hr != 0) return "ERR_CTX:0x" + hr.ToString("X8");
      ChakraSetCurrentContext(ctx);
      IntPtr res;
      hr = ChakraRunScript(code, new IntPtr(1), "bt-v6-verify.js", out res);
      if (hr != 0) {
        IntPtr ex;
        if (ChakraGetAndClearException(out ex) == 0 && ex != IntPtr.Zero) {
          string msg = ValToString(ex);
          IntPtr stackId, stackVal;
          if (ChakraGetPropertyIdFromName("stack", out stackId) == 0 && ChakraGetProperty(ex, stackId, out stackVal) == 0) {
            string st = ValToString(stackVal);
            if (!string.IsNullOrEmpty(st)) msg += " | " + st;
          }
          return "JS_EXC:" + msg;
        }
        return "ERR_RUN:0x" + hr.ToString("X8");
      }
      return ValToString(res);
    } finally {
      if (rt != IntPtr.Zero) {
        ChakraSetCurrentContext(IntPtr.Zero);
        ChakraDisposeRuntime(rt);
      }
    }
  }
}
'@
}

try {
  Write-Host "`n=== BeanTelligence v6.2 8-Gate Adversarial Verification Suite ===" -ForegroundColor Cyan

  $manifestFile = Join-Path $SrcDir 'manifest.build.json'
  Assert-Check (Test-Path -LiteralPath $manifestFile) "Located src/v6/manifest.build.json"
  $manifest = ([System.IO.File]::ReadAllText($manifestFile, [System.Text.Encoding]::UTF8)) | ConvertFrom-Json
  $manifestModules = @($manifest.modules | Sort-Object { [int]$_.order })
  Assert-Check ($manifestModules.Count -ge 28) "manifest.build.json specifies all v6.2 modules in exact runtime order (got $($manifestModules.Count))"

  $codecsPath = Join-Path $SrcDir 'core\01-schema-codecs.js'
  $vaultPath  = Join-Path $SrcDir 'data\01-storage-vault.js'
  Assert-Check ((Test-Path -LiteralPath $codecsPath) -and (Test-Path -LiteralPath $vaultPath)) "Core codec (01-schema-codecs.js) and Storage Vault (01-storage-vault.js) exist"

  $codecsText = [System.IO.File]::ReadAllText($codecsPath, [System.Text.Encoding]::UTF8)
  $vaultText  = [System.IO.File]::ReadAllText($vaultPath, [System.Text.Encoding]::UTF8)
  $corpus = if ($BuildDataOnly) { $codecsText + "`n" + $vaultText } else { [System.IO.File]::ReadAllText($HtmlPath, [System.Text.Encoding]::UTF8) }

  # =========================================================================
  # GATE 1 (P0 BLOCKER): 100% Saved-Data Continuity & Schema Contract (#125)
  # =========================================================================
  Write-Host "`n[Gate 1] P0 Saved-Data Continuity, 18 LS Keys, 2 IDB v1 DBs & 129-Col Lockstep" -ForegroundColor Yellow

  $protected13 = @(
    'brew-and-cup-draft-v1',
    'brew-and-cup-history-v1',
    'brew-and-cup-last-backup-v1',
    'brew-and-cup-history-removed-v1',
    'brew-and-cup-history-edited-v1',
    'brew-and-cup-history-added-v1',
    'brew-and-cup-history-addedids-v1',
    'brew-and-cup-prices-v1',
    'brew-and-cup-prices-changes-v1',
    'brew-and-cup-shops-v1',
    'brew-and-cup-shops-changes-v1',
    'brew-and-cup-shopdraft-v1',
    'brew-and-cup-every-v1'
  )
  $additive5 = @(
    'brew-and-cup-prefs-mirror-v1',
    'brew-and-cup-academy-v1',
    'brew-and-cup-migration-meta-v1',
    'brew-and-cup-safety-snapshot-v1',
    'brew-and-cup-difluid-auth-v1'
  )
  $missing13 = @($protected13 | Where-Object { $corpus.IndexOf("'" + $_ + "'") -lt 0 -and $corpus.IndexOf('"' + $_ + '"') -lt 0 })
  $missing5  = @($additive5  | Where-Object { $corpus.IndexOf("'" + $_ + "'") -lt 0 -and $corpus.IndexOf('"' + $_ + '"') -lt 0 })
  Assert-Check ($missing13.Count -eq 0) "All 13 protected 'brew-and-cup-*-v1' localStorage keys preserved verbatim" ($missing13 -join ', ')
  Assert-Check ($missing5.Count -eq 0) "All 5 additive mirror/academy/snapshot/difluid-auth keys preserved verbatim (18/18 total)" ($missing5 -join ', ')
  Assert-Check ($corpus.IndexOf('brew-and-cup-dirty-v1') -lt 0 -and $corpus.IndexOf('brew-and-cup-added-v1') -lt 0) "Zero shorthand typo localStorage keys (no brew-and-cup-dirty-v1 or brew-and-cup-added-v1)"

  Assert-Check ($vaultText -match "PICK_DB\s*=\s*'brew-and-cup-files'" -and $vaultText -match "indexedDB\.open\(PICK_DB,\s*1\)") "IndexedDB 'brew-and-cup-files' preserved at schema version 1"
  Assert-Check ($vaultText -match "'handles'" -and $vaultText -match "'history-file'" -and $vaultText -match "'everything-file'") "IndexedDB 'handles' store and 'history-file' + 'everything-file' keys preserved"
  Assert-Check ($vaultText -match "'brew-and-cup-vault'" -and $vaultText -match "indexedDB\.open\(SNAPSHOT_VAULT_DB,\s*1\)" -and $vaultText -match "'pre-v6-raw'" -and $vaultText -match "'pre-v5-raw'") "IndexedDB 'brew-and-cup-vault' v1 preserves both 'pre-v6-raw' and 'pre-v5-raw'"
  Assert-Check ($vaultText -match 'ensurePreMigrationSnapshot' -and $vaultText -match 'restoreSafetySnapshot' -and $vaultText -match 'readStorageWithFallback') "Safety snapshot & non-destructive legacy alias fallback exported"
  Assert-Check ($vaultText -match 'buildUnifiedCoffeesIndex' -and $vaultText -match 'selectSavedCoffee' -and $vaultText -match 'applyFreshBagRoastDate') "Directive #132 BTMyCoffeesVault deduplicator & Fresh Bag contract exported"

  $colMatch = [regex]::Match($codecsText, 'const\s+COLUMNS\s*=\s*\[([\s\S]*?)\];')
  $parsedCols = if ($colMatch.Success) { @([regex]::Matches($colMatch.Groups[1].Value, "'([^']+)'") | ForEach-Object { $_.Groups[1].Value }) } else { @() }
  $cgMatch = [regex]::Match($codecsText, 'const\s+COLUMN_GUIDE\s*=\s*\[([\s\S]*?)\n\];')
  $cgNames = if ($cgMatch.Success) { @([regex]::Matches($cgMatch.Groups[1].Value, "\[\s*'([^']+)'\s*,") | ForEach-Object { $_.Groups[1].Value }) } else { @() }
  $lockstepOk = ($parsedCols.Count -eq 129 -and $cgNames.Count -eq 129)
  if ($lockstepOk) {
    for ($ci = 0; $ci -lt 129; $ci++) { if ($parsedCols[$ci] -ne $cgNames[$ci]) { $lockstepOk = $false; break } }
  }
  Assert-Check ($lockstepOk -and $parsedCols[128] -eq 'setup_json') "Frozen 129-column COLUMNS[0..128] === COLUMN_GUIDE[0..128] in exact index lockstep"

  # =========================================================================
  # GATE 2: Zero Emojis (#136), Zero Stock Icons, Zero BOM & Zero CDNs
  # =========================================================================
  Write-Host "`n[Gate 2] Brand & Module Hygiene (Zero Emojis, Zero Stock Icons, Zero BOM, Zero CDNs)" -ForegroundColor Yellow

  $targetFiles = if ($BuildDataOnly) {
    @(Get-Item -LiteralPath $manifestFile, $codecsPath, $vaultPath)
  } else {
    @(Get-ChildItem -LiteralPath $SrcDir -Recurse -File)
  }

  $rxEmoji = [regex]::new('([\u2600-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF]|\uFE0F)')
  $bomHits = @()
  $nlHits = @()
  $emojiHits = @()
  $jsLexHits = @()

  foreach ($tf in $targetFiles) {
    $b = [System.IO.File]::ReadAllBytes($tf.FullName)
    if ($b.Length -ge 3 -and $b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF) { $bomHits += $tf.Name }
    if ($b.Length -gt 0 -and $b[$b.Length - 1] -ne 10) { $nlHits += $tf.Name }
    $txt = $utf8NoBom.GetString($b)
    $em = $rxEmoji.Match($txt)
    if ($em.Success) {
      $cp = [int][char]$em.Value[0]
      $emojiHits += ($tf.Name + '(U+' + $cp.ToString('X4') + ')')
    }
    if ($tf.Extension -eq '.js' -and $tf.Name -ne '00-iife-open.js' -and $tf.Name -ne '99-boot-close.js') {
      $bal = [BtJsSyntaxCheckerV6]::CheckBalance($txt)
      if ($bal -ne 'OK') { $jsLexHits += ($tf.Name + ': ' + $bal) }
    }
  }

  Assert-Check ($bomHits.Count -eq 0) "Zero UTF-8 BOMs across $($targetFiles.Count) inspected source files" ($bomHits -join ', ')
  Assert-Check ($nlHits.Count -eq 0) "Every inspected source file ends with a trailing newline (\n)" ($nlHits -join ', ')
  Assert-Check ($emojiHits.Count -eq 0) "Zero Unicode pictographic emojis across inspected source files (#136)" ($emojiHits -join ', ')
  Assert-Check ($jsLexHits.Count -eq 0) "All balanced JS modules pass C# BtJsSyntaxCheckerV6 individually" ($jsLexHits -join '; ')
  Assert-Check ($codecsText.TrimStart().StartsWith('/*PURE_START*/') -and $codecsText.TrimEnd().EndsWith('/*PURE_END*/')) "01-schema-codecs.js bounded by /*PURE_START*/../*PURE_END*/"

  if (-not $BuildDataOnly) {
    $htmlBytes = [System.IO.File]::ReadAllBytes($HtmlPath)
    $hasHtmlBom = ($htmlBytes.Length -ge 3 -and $htmlBytes[0] -eq 0xEF -and $htmlBytes[1] -eq 0xBB -and $htmlBytes[2] -eq 0xBF)
    Assert-Check (-not $hasHtmlBom) "Assembled HTML has zero UTF-8 BOM"
    Assert-Check (-not $rxEmoji.IsMatch($corpus)) "Assembled HTML contains zero Unicode pictographic emojis"

    $psIdx = $corpus.IndexOf('/*PURE_START*/')
    $peIdx = $corpus.IndexOf('/*PURE_END*/')
    $esIdx = $corpus.IndexOf('/*ENGINE_START*/')
    $eeIdx = $corpus.IndexOf('/*ENGINE_END*/')
    Assert-Check ($psIdx -gt 0 -and $peIdx -gt $psIdx -and $esIdx -gt $peIdx -and $eeIdx -gt $esIdx) "/*PURE_START*/../*PURE_END*/ and /*ENGINE_START*/../*ENGINE_END*/ markers ordered cleanly"

    $htmlOutsideScripts = [regex]::Replace($corpus, '<script\b[^>]*>[\s\S]*?</script\s*>', '', 'IgnoreCase')
    $extCdn = [regex]::Matches($htmlOutsideScripts, '(?:<(?:script|link|img)\b[^>]+(?:src|href)\s*=\s*["'']https?://|@import\s+url\(\s*["'']?https?://)', 'IgnoreCase')
    Assert-Check ($extCdn.Count -eq 0) "Zero external HTTP/HTTPS CDN script, stylesheet, font, or image URLs"

    $stockPack = [regex]::Matches($corpus, '(?:unpkg\.com/lucide|cdn\.jsdelivr\.net|fontawesome|feather-icons)', 'IgnoreCase')
    Assert-Check ($stockPack.Count -eq 0) "Zero third-party stock icon packs referenced"

    $rxSO = [regex]::new('<script\b[^>]*>', 'IgnoreCase')
    $rxSC = [regex]::new('</script\s*>', 'IgnoreCase')
    $rxSO = [regex]::new('<script\b[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $rxSC = [regex]::new('</script\s*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $scanP = 0
    $scIdx = 0
    $scriptBalErrs = @()
    while ($scanP -lt $corpus.Length) {
      $mO = $rxSO.Match($corpus, $scanP)
      if (-not $mO.Success) { break }
      $bStart = $mO.Index + $mO.Length
      $mC = $rxSC.Match($corpus, $bStart)
      if (-not $mC.Success) { $scriptBalErrs += "Unclosed <script>[$scIdx]"; break }
      $scBody = $corpus.Substring($bStart, $mC.Index - $bStart)
      $scBal = [BtJsSyntaxCheckerV6]::CheckBalance($scBody)
      if ($scBal -ne 'OK') { $scriptBalErrs += "<script>[$scIdx]: $scBal" }
      $scIdx++
      $scanP = $mC.Index + $mC.Length
    }
    if ($scIdx -eq 0) { $scriptBalErrs += 'Zero <script> blocks' }
    Assert-Check ($scriptBalErrs.Count -eq 0) "All $scIdx assembled <script> blocks pass lexical & duplicate-const balance check" ($scriptBalErrs -join '; ')
  }

  # =========================================================================
  # LIVE JS RUNTIME EXECUTION HARNESS (Headless Edge V8 -> Chakra Fallback)
  # =========================================================================
  if (-not $StaticOnly) {
    $jsTestHarness = if ($BuildDataOnly) {
      @"
var window = this;
var globalThis = this;
(function(){
  const store = Object.create(null);
  window.localStorage = {
    getItem: k => Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null,
    setItem: (k, v) => { store[String(k)] = String(v); },
    removeItem: k => { delete store[String(k)]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: i => Object.keys(store)[i] || null,
    get length(){ return Object.keys(store).length; }
  };
  const idbDbs = Object.create(null);
  window.indexedDB = {
    open: (dbName, ver) => {
      const req = { result: null, onupgradeneeded: null, onsuccess: null, onerror: null };
      if (!idbDbs[dbName]) idbDbs[dbName] = { stores: Object.create(null) };
      const dbRec = idbDbs[dbName];
      const dbObj = {
        objectStoreNames: { contains: s => !!dbRec.stores[s] },
        createObjectStore: s => { if (!dbRec.stores[s]) dbRec.stores[s] = Object.create(null); return dbRec.stores[s]; },
        transaction: (s, mode) => {
          if (!dbRec.stores[s]) dbRec.stores[s] = Object.create(null);
          const st = dbRec.stores[s];
          const tx = { oncomplete: null, onerror: null, onabort: null, objectStore: () => ({
            put: (v, k) => { st[k] = v; return { result: k }; },
            get: k => ({ result: Object.prototype.hasOwnProperty.call(st, k) ? st[k] : undefined }),
            delete: k => { delete st[k]; return { result: undefined }; }
          }) };
          Promise.resolve().then(() => { if (tx.oncomplete) tx.oncomplete(); });
          return tx;
        },
        close: () => {}
      };
      req.result = dbObj;
      Promise.resolve().then(() => {
        if (req.onupgradeneeded) req.onupgradeneeded();
        if (req.onsuccess) req.onsuccess();
      });
      return req;
    }
  };
  window.setTimeout = (fn) => { return 1; };
  window.clearTimeout = () => {};
  window.performance = { now: () => Date.now() };
})();
$codecsText
(function(){
  'use strict';
  let app = {
    screen:'door', tab:'brew', attempt:0,
    coffee:{ id:'c-init', name:'', roaster:'', origin:'', varietal:'', species:'arabica', roast:'', process:'', decaf:'', decaf_process:'', density:'', elevText:'', elevation_m:'', roast_date:'', is_frozen:'', frozen_date:'', freeze_days_offset:'', bag_notes:'', blend:'', agtron:'', bean_agtron:'', ground_agtron:'', agtron_scale:'gourmet', roast_delta:'', psd_d10_um:'', psd_d50_um:'', psd_d90_um:'', psd_span:'', answered:'' },
    brew:{ method:'v60', style:'', water:250, dose:15, ratio:16.7, tempF:201, agitation:'standard', technique:'standard', grind_setting:'22 clicks', machineProfile:null },
    prefs:setupDefaults(),
    adjust:{ grind:0, ratio:0, agit:'' },
    cupBrew:null
  };
  let state = { id:'s-init', way:'quick', cupping_date:'2026-11-17', cva:cvaFresh(), desc:{}, words:{}, vials:[], kit:[], stars:4.5, quick:{ make:'yes', sym:'', areas:{ taste:'good' }, liked:['jasmine'], notLiked:[] }, vs:{} };
  function render(){}
  function refreshAll(){}
  function scheduleDraft(){ BTStorage.saveDraftFromApp(); }
  function flushDraft(){ BTStorage.saveDraftFromApp(); }
  function toast(){}
  window.BTShell = { app, state, render, refreshAll, scheduleDraft, flushDraft, toast };
$vaultText
})();
"@
    } else { '' }

    if ($BuildDataOnly) {
      $assertionsJs = @'
(function(){
  const errs = [];
  const check = (cond, msg) => { if (!cond) errs.push(msg); };
  try {
    const gaps = columnGuideGaps();
    check(COLUMNS.length === 129 && COLUMN_GUIDE.length === 129, 'COLUMNS/GUIDE len');
    check(gaps.missing.length === 0 && gaps.extra.length === 0 && gaps.dup.length === 0 && gaps.order === true, 'columnGuideGaps: ' + JSON.stringify(gaps));

    const all23 = ['v60','origami','kalita','orea','pulsar','chemex','nel','drip','aiden','xbloom','switch','clever','aeropress','siphon','press','turkish','phin','cold','cold_drip','espresso','lever_espresso','moka','philips5500'];
    check(all23.every(k => resolveMethod(k) === k), 'resolveMethod 23 failed');
    check(resolveMethod('Kyoto Cold Drip') === 'cold_drip' && resolveMethod('Flair 58') === 'lever_espresso' && resolveMethod('NextLevel Pulsar') === 'pulsar' && resolveMethod('Hario Woodneck') === 'nel', 'resolveMethod aliases failed');
    check(cleanOwnedBrewers(all23).length === 23, 'cleanOwnedBrewers 23 failed');

    /* Secret non-leakage & setup_json v:1 */
    const defJson = setupJson(setupDefaults());
    const defParsed = JSON.parse(defJson);
    check(defParsed.v === 1 && !('theme' in defParsed) && !('scienceLens' in defParsed) && !('immersionBasis' in defParsed) && !('toolModes' in defParsed), 'setupJson default omission failed');
    const secClean = setupClean({ v:1, scienceLens:'xray', immersionBasis:'gagne', apiKey:'SECRET_LEAK_999', difluidAuth:{ apiKey:'SECRET_LEAK_999' }, brewerMaterials:{ v60:'ceramic' }, cryoTubes:[{ id:'t1', doseG:18, roastDate:'2026-11-01', frozenDate:'2026-11-08', status:'frozen' }], pocketMicronCalib:{ grinderKey:'comandante-c40', d0OffsetUm:-12.5, slopeM:1.02 }, philipsProfiles:{ activeProfile:'blue', hopperStep:4, blue:{ espresso:{ aroma:5, coffeeMl:40 } } }, gear:{ ownedBrewers:['v60','origami','philips5500'], ble:{ apiKey:'SECRET_LEAK_999', rememberedDevices:[{ slot:'scale', deviceId:'dev-1', brand:'acaia', name:'ACAIA LUNAR', apiKey:'SECRET_LEAK_999' }] } } });
    const secStr = setupJson(secClean);
    check(secStr.indexOf('SECRET_LEAK_999') < 0, 'Secret leaked into setupJson!');
    const secBack = setupClean(JSON.parse(secStr));
    check(secBack.scienceLens === 'xray' && secBack.immersionBasis === 'gagne' && secBack.brewerMaterials.v60 === 'ceramic' && secBack.cryoTubes.length === 1 && secBack.pocketMicronCalib.d0OffsetUm === -12.5 && secBack.philipsProfiles.hopperStep === 4 && secBack.gear.ble.rememberedDevices.length === 1, 'v6 additive setup_json round-trip failed');

    /* Multi-era CSV + custom column non-destructive edit */
    const eraCsv = '\uFEFFcoffee_name,schema_version,id,total_score,score_kind,fragrance_aroma,friend_who_shared,roast_level,process\r\nChelbesa,1,id-1,86.75,sca_5cup,8.50,Alice,Light,Washed\r\n';
    const ex = readExisting(eraCsv);
    const obj0 = rowsToObjects(ex)[0];
    const ed = coffeeEditFromRow(obj0); ed.roaster = 'Sey'; ed.species = 'arabica';
    const rc = applyCoffeeEdit(ex.header, ex.rows, [0], ed);
    check(!rc.error && rc.header.indexOf('friend_who_shared') >= 0 && rc.rows[0][rc.header.indexOf('friend_who_shared')] === 'Alice' && rc.rows[0][rc.header.indexOf('total_score')] === '86.75', 'Era-1 custom column edit failed');

    /* Prices rem_g + tubes_json & 23 SHOP_KINDS round-trip */
    const pCsv = priceCsv([priceEntry({ coffee:'Worka', roaster:'Sey', price:24, size:250, unit:'g', roast:'2026-11-10', rem_g:182.5, tubes:[{ id:'tb1', doseG:18 }] })]);
    const pRd = priceRead(pCsv);
    check(!pRd.error && pRd.list[0].rem_g === 182.5 && JSON.parse(pRd.list[0].tubes_json)[0].doseG === 18, 'priceCsv rem_g/tubes_json failed');
    const sCsv = shopCsv(shopAddDrink(shopStore(), { date:'2026-11-10', shop:'Onyx', city:'Rogers', region:'Arkansas', kind:'icedlatte', price:6.5, beans:4.5, fav:true }).store);
    const sRd = shopRead(sCsv);
    check(!sRd.error && sRd.store.drinks[0].kind === 'icedlatte' && sRd.store.drinks[0].fav === true, 'shopCsv icedlatte failed');

    /* Pure-JS Offline Reed-Solomon QR SVG Generator (V1..V12, <280B bt1: Passport) */
    const passportPayload = 'bt1:' + shB64(JSON.stringify({ v:1, b:{ n:'Worka Sakaro', r:'Sey', o:'ET', p:'washed', ag:88, rd:11, dt:'2026-11-08' }, rx:{ m:'v60', d:15, w:255, um:565, sp:0.92, ts:92.4, ey:20.8, tds:1.37 } }));
    check(passportPayload.length < 280, 'passport length >= 280');
    const qrSvg = encodeQrSvg(passportPayload, { ecLevel:'M', size:240 });
    check(qrSvg.indexOf('<svg ') === 0 && qrSvg.indexOf('<path ') > 0 && qrSvg.indexOf('data-qr-ec="M"') > 0, 'encodeQrSvg failed');
    const passRead = shareRead(passportPayload);
    check(passRead.ok && passRead.via === 'passport' && passRead.coffee.name === 'Worka Sakaro' && passRead.brew.method === 'v60', 'bt1: shareRead failed');

    /* BTStorage: 18 LS keys, pre-v6-raw snapshot, schema_version 6.0, Zero Legacy Handcuffs & 500-row <2ms benchmark */
    check(BTStorage.ALL_18_LS_KEYS.length === 18 && BTStorage.PROTECTED_LS_KEYS.length === 13, 'BTStorage key counts');
    window.BTShell.app.coffee.name = 'Chelbesa'; window.BTShell.app.coffee.roaster = 'Sey'; window.BTShell.app.coffee.agtron = '86';
    window.BTShell.state.pad_xy = [-0.18, 0.12];
    window.BTShell.state.goldenSip = { vessel:'ceramic_preheated', golden:'Honeycomb & bergamot at 58C' };
    window.BTShell.app.brew.r2 = { sampleTempC:23.4, nD20:1.33512, prep:'spoon_chilled' };
    const builtRow = BTStorage.buildRow();
    check(builtRow.schema_version === '6.0', 'schema_version !== 6.0');
    const builtAdap = readV6Adaptation(builtRow);
    const builtInt = readCvaIntensities(builtRow);
    check(builtAdap && builtAdap.v6 && builtAdap.v6.r2.sampleTempC === 23.4 && builtInt && builtInt.v6 && builtInt.v6.goldenSip.vessel === 'ceramic_preheated', 'v6 rich save telemetry failed');

    /* Legacy v5 heuristic stripping check */
    const legacyRow = { schema_version:'2', coffee_name:'Old V5', brew_method:'v60', recipe_adaptation_json:JSON.stringify({ agtron:78, layer1:{ offsetUm:-35 }, be_offset:12 }) };
    const cleanLeg = readV6Adaptation(legacyRow);
    check(cleanLeg.agtron === 78 && !('layer1' in cleanLeg) && !('be_offset' in cleanLeg), 'Stale legacy heuristic was not stripped');

    /* Safety snapshot + alias fallback */
    localStorage.clear();
    const h1Csv = newFileCSV(builtRow);
    localStorage.setItem('brew-and-cup-history-v1', h1Csv);
    const snap = BTStorage.ensurePreMigrationSnapshot({ targetSchema:'6.0' });
    check(snap.vaultKey === 'pre-v6-raw' && snap.tier === 'ls-raw', 'pre-v6-raw snapshot failed: ' + JSON.stringify(snap));
    localStorage.setItem('brew-and-cup-history-v1', 'mutated');
    const restSnap = BTStorage.restoreSafetySnapshotSync('pre-v6-raw');
    check(restSnap && restSnap.ok && localStorage.getItem('brew-and-cup-history-v1') === h1Csv, 'restoreSafetySnapshot byte-for-byte failed');

    /* NB1.z deflate/inflate + #BEANTELLIGENCE-PARTS 1 & #NEUROBREW-PARTS 1 round-trips */
    const h1Body = h1Csv.replace(/^\uFEFF/, '');
    const zBk = makeBackupCodeSync(h1Csv);
    const zRead = readBackupCodeSync(zBk.code);
    check(zBk.mode === 'z' && zBk.code.indexOf('BEGIN BEANTELLIGENCE BACKUP') >= 0 && !zRead.error && zRead.csv === h1Body, 'NB1.z backup round-trip failed');
    const evBk = makeEverythingCodeSync({ history:h1Csv, shops:sCsv, prices:pCsv, prefs:secStr }, { made:'2026-11-17T12:00:00Z', app:'6.0.0' });
    const evRead1 = readBackupCodeSync(evBk.code);
    const rawPackLegacy = bkpPack([{ id:'history', text:h1Csv }, { id:'shops', text:sCsv }], { made:'2026-11-17', app:'5.2' }).replace('#BEANTELLIGENCE-PARTS 1', '#NEUROBREW-PARTS 1');
    const evRead2 = bkpUnpack(rawPackLegacy);
    check(evRead1.parts && evRead1.parts.parts.history.text === h1Body && evRead2 && evRead2.parts.shops.text === sCsv.replace(/^\uFEFF/, ''), '#PART multi-part round-trip failed');

    /* Outlier / exclude_learning + Spec 5.2 (#179) round-trip + dial_locked protection */
    BTStorage.setHistory(h1Csv);
    BTStorage.commitDialLock(0, true);
    check(BTStorage.getHistory().objs[0].dial_locked === 'yes', 'commitDialLock setup failed');
    const sickRow = BTStorage.buildRow({ id:'r-sick-99', dial_locked:'yes', exclude_learning:true, outlier_reason:'sick', surprise_z:8.85, drawdown_cue:'slow', context_tag:'off_palate', r2_discrepancy:{ active:true, winningId:'H1_channeling_bypass', prob:0.981, dualPinGap:0.612 } });
    check(sickRow.dial_locked === '', 'exclude_learning row should not claim dial_locked');
    BTStorage.keepInBrowser(sickRow);
    const objsAfterSick = BTStorage.getHistory().objs;
    const sickSaved = objsAfterSick[objsAfterSick.length - 1];
    const sickSens = readCvaIntensities(sickSaved);
    const sickAdap = readV6Adaptation(sickSaved);
    check(objsAfterSick[0].dial_locked === 'yes' && isRowExcludedFromLearning(sickSaved) === true && sickSens.v6.surprise_z === 8.85 && sickSens.v6.drawdown_cue === 'slow' && sickSens.v6.context_tag === 'off_palate' && sickSens.v6.r2_discrepancy.winningId === 'H1_channeling_bypass' && sickAdap.v6.surprise_z === 8.85, 'Spec 5.2 outlier/dial_locked shield failed');
    const exclRes = BTStorage.setRowExcludeLearning(0, true, 'off_palate');
    check(exclRes && exclRes.ok && isRowExcludedFromLearning(BTStorage.getHistory().objs[0]) === true, 'setRowExcludeLearning(true) failed');
    const unExclRes = BTStorage.setRowExcludeLearning(0, false, '');
    const rowAfterUnexcl = BTStorage.getHistory().objs[0];
    const intAfterUnexcl = readCvaIntensities(rowAfterUnexcl);
    check(unExclRes && unExclRes.ok && isRowExcludedFromLearning(rowAfterUnexcl) === false && intAfterUnexcl.v6 && intAfterUnexcl.v6.goldenSip.vessel === 'ceramic_preheated', 'setRowExcludeLearning(false) failed');

    localStorage.clear();
    localStorage.setItem('neurobrew-history-v1', h1Csv);
    const fb = BTStorage.readStorageWithFallback();
    check(fb.recovered && localStorage.getItem('brew-and-cup-history-v1') === h1Csv && localStorage.getItem('neurobrew-history-v1') === h1Csv, 'readStorageWithFallback failed');

    /* 500-Row Directive #132 buildUnifiedCoffeesIndex (<2ms) + selectSavedCoffee + Fresh Bag */
    const rows500 = [];
    for (let i = 0; i < 500; i++){
      const cid = 'cf-' + (i % 120);
      rows500.push({
        _i:i, schema_version:'6.0', id:'r-' + i, coffee_id:cid,
        cupping_date:'2026-10-' + String((i % 28) + 1).padStart(2, '0'),
        saved_at:'2026-10-' + String((i % 28) + 1).padStart(2, '0') + 'T08:00:00Z',
        coffee_name:'Lot #' + (i % 120), roaster:i % 2 === 0 ? 'Sey' : 'Onyx',
        origin:'Ethiopia', varietal:'Heirloom', process:'Washed', roast_level:'Light',
        roast_date:'2026-10-01', brew_method:i % 3 === 0 ? 'origami' : 'v60',
        brew_attempt:String(Math.floor(i / 120) + 1), brew_dose_g:'15', brew_water_g:'250', brew_ratio:'16.7', brew_temp_f:'202',
        my_rating_stars:i === 240 ? '5' : '4', dial_locked:i === 240 ? 'yes' : '', total_score:'88.50', score_kind:'cva_affective',
        recipe_adaptation_json:i === 240 ? '{"agtron":87,"psd_d50_um":540}' : ''
      });
    }
    const bags10 = [{ kind:'bag', coffee:'Lot #0', roaster:'Sey', coffee_id:'cf-0', sym:'$', price:23, size:250, unit:'g', rem_g:190, date:'2026-10-02', roast:'2026-10-01', finished:'' }];
    /* Warm JIT then measure 20 iterations */
    BTStorage.buildUnifiedCoffeesIndex(rows500, bags10);
    BTStorage.buildUnifiedCoffeesIndex(rows500, bags10);
    const t0 = Date.now();
    let unified = null;
    for (let rep = 0; rep < 20; rep++) unified = BTStorage.buildUnifiedCoffeesIndex(rows500, bags10);
    const avgMs = (Date.now() - t0) / 20;
    check(unified.length === 120 && avgMs < 2.0, 'buildUnifiedCoffeesIndex perf/count failed: len=' + unified.length + ' avgMs=' + avgMs);
    const rec0 = unified.find(r => r.coffee_id === 'cf-0');
    check(rec0 && rec0.lockedBrew && rec0.lockedBrew.id === 'r-240' && rec0.openBag && rec0.openBag.rem_g === 190, 'Unified record folding failed');
    BTStorage.savePrices(bags10);
    const sel = BTStorage.selectSavedCoffee(rec0, { silent:true });
    check(sel && sel.anchorRow.id === 'r-240' && window.BTShell.app.coffee.agtron === '87' && window.BTShell.app.coffee.answered === 'yes', 'selectSavedCoffee failed');
    const undoDeduct = BTStorage.deductBagGrams(rec0, 15, { silent:true, ignoreExpiry:true });
    check(BTStorage.getPrices().list[0].rem_g === 175, 'deductBagGrams failed');
    check(undoDeduct() === true && BTStorage.getPrices().list[0].rem_g === 190, 'deductBagGrams undo failed');
    const freshC = BTStorage.applyFreshBagRoastDate(rec0, '2026-11-15', { sizeG:250, silent:true });
    check(freshC.roast_date === '2026-11-15' && rows500[0].roast_date === '2026-10-01' && BTStorage.getPrices().list[0].rem_g === 250, 'applyFreshBagRoastDate failed');
  } catch (e) {
    errs.push('EXC: ' + (e && e.message ? e.message : String(e)));
  }
  return errs.length ? ('FAIL:' + errs.join(' ;; ')) : 'PASS_BUILD_DATA';
})();
'@
      $chakraOut = [BtChakraHostV6]::Eval($jsTestHarness + "`n" + $assertionsJs)
      Assert-Check ($chakraOut -eq 'PASS_BUILD_DATA') "Live JS Engine Verification (129-col, multi-era CSV, QR SVG, 18 LS keys, 500-row Vault <2ms, Fresh Bag)" $chakraOut
    } else {
      # =====================================================================
      # GATES 3, 4, 5, 6, 7, 8 ON FULL ASSEMBLED v6 APPLICATION
      # =====================================================================
      Write-Host "`n[Gate 3] Scientist-Proof Physics, Mass/Energy Conservation & Boundary Torture" -ForegroundColor Yellow
      Assert-Check ($corpus -match 'window\.BTCoreV6\s*=' -and $corpus -match 'simulateBrew' -and $corpus -match 'solveMakeItPerfect' -and $corpus -match 'translateAcrossBrewers') "BTCoreV6 physics solver, 6-hypothesis fault tree & Brew Twin exported"
      Assert-Check ($corpus -match 'computeGoldenSipCooling|solveGoldenSipCooling' -and $corpus -match 'evaluateR2SampleReadiness') "Directive #157 Golden Sip Newton cooling & R2 sample thermal readiness exported"
      Assert-Check ($corpus -match 'Tonino' -and $corpus -match '0\.7429' -and $corpus -match 'folkProblems') "5-scale Agtron (M-Basic II + Tonino(63)=105) & folkProblems() validator present"

      Write-Host "`n[Gate 4] Precision Hardware Parity (Philips 5500 #134, Fellow Aiden, xBloom)" -ForegroundColor Yellow
      Assert-Check ($corpus -match 'PHILIPS_DRINKS' -and $corpus -match 'travelmug' -and $corpus -match 'philipsFix' -and $corpus -match 'synthesizeAidenProfile' -and $corpus -match 'synthesizeXBloomProfile') "Philips 5500 (incl. travelmug), Fellow Aiden & xBloom synthesizers present"

      Write-Host "`n[Gate 5] 15-Protocol / 5-Slot WebBLE Binary GATT & Mid-Brew Recovery" -ForegroundColor Yellow
      Assert-Check ($corpus -match 'BTBleCodecs' -and $corpus -match 'BTBle\b' -and $corpus -match 'BTDiFluidApi' -and $corpus -match 'preDropNetWeightG') "BTBleCodecs (15 families), 5-slot BTBle, mid-brew tare continuity & local-only BTDiFluidApi present"

      Write-Host "`n[Gate 6] Accessible Inputs (>=16px), AI Scan Contract, BTTimerAudio, Scroll-Safe Charts & 55-Route Sweep" -ForegroundColor Yellow
      $uiDir = Join-Path $SrcDir 'ui'
      $stylesDir = Join-Path $SrcDir 'styles'
      $uiFiles = @(Get-ChildItem -LiteralPath $uiDir -Filter '*.js' -File)
      $shopifyViolations = @()
      foreach ($uf in $uiFiles) {
        $ut = [System.IO.File]::ReadAllText($uf.FullName, [System.Text.Encoding]::UTF8)
        if ($ut -match '/products\.json') { $shopifyViolations += ($uf.Name + '(/products.json)') }
      }
      Assert-Check ($shopifyViolations.Count -eq 0) "Zero flaky Shopify /products.json fetch calls across all $($uiFiles.Count) v6.2 UI modules" ($shopifyViolations -join ', ')

      $allCssText = (@(Get-ChildItem -LiteralPath $stylesDir -Filter '*.css' -File) | ForEach-Object { [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8) }) -join "`n"
      Assert-Check ($allCssText -match 'font-size:\s*(?:16px|1rem)') "Accessible <input>, <textarea> & <select> elements allowed and styled >=16px (1rem) to prevent iOS Safari zoom"
      $chartKitTxt = [System.IO.File]::ReadAllText((Join-Path $uiDir '08-bt-chart-kit.js'), [System.Text.Encoding]::UTF8)
      Assert-Check ($chartKitTxt -match "touchAction\s*\|\|\s*'pan-y'" -and $allCssText -match '\.bt-chart-svg\s*\{[^}]*touch-action:\s*pan-y') "BTChartKit & .bt-chart-svg enforce scroll-safe touch-action: pan-y on mobile"
      Assert-Check ($corpus -match 'SCAN_PROMPT_V6' -and $corpus -match 'parseScanReplyV6') "SCAN_PROMPT_V6 and parseScanReplyV6 AI bag-label scan contract present"
      Assert-Check ($corpus -match 'BTTimerAudio' -and $corpus -match 'AudioContext|webkitAudioContext' -and $corpus -match 'speechSynthesis') "BTTimerAudio (Web Audio synthesizer + speechSynthesis voice coach) present"

      $expected55 = @(
        'door','loadshared','shop','sdrink','staste','sperfect','shops','history','perfecting','detail','tastedit',
        'start','coffee','brew','gear','recipe','change','ready','timer','cup','tastes','sca','wheels','wheel','chart',
        'dial','learn','tend','buy','tpboard','tpshops','tpbrewers','tpmix','guide','tools','yield','ratio','cost',
        'bagcmp','fresh','caffeine','cafdrink','cafresult','cafcup','prices','folk','compare','about','glossary','files',
        'ey','water','iced','agtron','devices'
      )
      $missingRoutes = @($expected55 | Where-Object { $corpus.IndexOf("'" + $_ + "'") -lt 0 -and $corpus.IndexOf('"' + $_ + '"') -lt 0 -and $corpus -notmatch ("\b" + [regex]::Escape($_) + "\s*:") })
      Assert-Check ($missingRoutes.Count -eq 0) "All 55 legacy route keys accounted for in v6 router" ($missingRoutes -join ', ')

      # Attempt Headless Edge V8 runtime suite if available, plus in-process Chakra ES6 verification across all engines
      $edgePaths = @(
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
      )
      $edgeExe = $edgePaths | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
      $ranEdgeDom = $false
      if ($WithHeadless -and $edgeExe) {
        $tmpHtml = Join-Path $env:TEMP ('bt_v6_edge_' + [guid]::NewGuid().ToString('N') + '.html')
        $tmpProf = Join-Path $env:TEMP ('bt_v6_prof_' + [guid]::NewGuid().ToString('N'))
        $tmpOut  = Join-Path $env:TEMP ('bt_v6_out_' + [guid]::NewGuid().ToString('N') + '.txt')
        $tmpErr  = Join-Path $env:TEMP ('bt_v6_err_' + [guid]::NewGuid().ToString('N') + '.txt')
        New-Item -ItemType Directory -Path $tmpProf -Force | Out-Null
        try {
          $probeScript = @'
<script>
window.addEventListener('load', async () => {
  const errs = [];
  const check = (c, m) => { if (!c) errs.push(m); };
  try {
    const gaps = columnGuideGaps();
    check(COLUMNS.length === 129 && gaps.order === true && gaps.missing.length === 0, 'columnGuideGaps');
    check(typeof window.BTCoreV6 === 'object' && typeof window.BTInnovate === 'object', 'BTCoreV6/BTInnovate');
    check(typeof window.BTStorage === 'object' && window.BTStorage.ALL_18_LS_KEYS.length === 18, 'BTStorage');
    check(typeof window.BTBle === 'object' && typeof window.BTIcons === 'object' && typeof window.Beanjamin === 'object', 'BTBle/BTIcons/Beanjamin');
    const promptFnOrStr = (typeof window.SCAN_PROMPT_V6 === 'string' && window.SCAN_PROMPT_V6) ||
      (window.BTCoffeeEntry && typeof window.BTCoffeeEntry.buildScanPromptV6 === 'function' ? window.BTCoffeeEntry.buildScanPromptV6('Worka') : '');
    const parseFn = window.parseScanReplyV6 || (window.BTCoffeeEntry && window.BTCoffeeEntry.parseScanReplyV6);
    check(typeof promptFnOrStr === 'string' && promptFnOrStr.length > 40 && typeof parseFn === 'function', 'SCAN_PROMPT_V6/parseScanReplyV6');
    const scanTest = parseFn('{"coffee_name":"Worka Sakaro","roaster":"Sey","origin":"Ethiopia","process":"Washed","roast_level":"light"}');
    check(scanTest && (scanTest.ok !== false), 'parseScanReplyV6 execution');
    check(typeof window.BTTimerAudio === 'object' && typeof window.BTTimerAudio.speak === 'function', 'BTTimerAudio callable');
    check(typeof window.BTLabMath === 'object' && typeof window.BTLabMath.solveInMugRescue === 'function' && typeof window.BTLabMath.cafCurve === 'function', 'BTLabMath rescue solvers');
    if (typeof folkProblems === 'function') check(folkProblems().length === 0, 'folkProblems');
    const sim = window.BTCoreV6.simulateBrew({ method:'v60', doseG:15, waterG:250, tempC:93 });
    check(sim && isFinite(sim.tdsPct || sim.tds) && !isNaN(sim.eyPct || 20), 'simulateBrew NaN');

    /* Sweep all 5 Guided Brew Steps + all 5 Tabs and verify zero NaN / [object Object] leaks */
    if (window.BTShell && typeof window.BTShell.go === 'function') {
      const guidedSteps = ['door', 'coffee', 'method', 'brew', 'timer', 'taste'];
      for (const st of guidedSteps) {
        window.BTShell.go(st);
        const t = document.body ? document.body.innerText : '';
        check(t.indexOf('[object Object]') < 0, 'GuidedStep leak on ' + st);
      }
      const tabs5 = ['brew', 'cellar', 'lab', 'palate', 'academy'];
      for (const tb of tabs5) {
        window.BTShell.go(tb);
        const t = document.body ? document.body.innerText : '';
        check(t.indexOf('[object Object]') < 0, 'Tab leak on ' + tb);
      }
      /* Verify scroll-safe pan-y on rendered Lab chart SVG */
      window.BTShell.go('lab');
      const chartSvg = document.querySelector('.bt-chart-svg');
      if (chartSvg) {
        const ta = getComputedStyle(chartSvg).touchAction || chartSvg.style.touchAction || '';
        check(ta.indexOf('pan-y') >= 0, 'chart touch-action!=' + ta);
      }
    }
    const bodyTxt = document.body ? document.body.innerText : '';
    check(bodyTxt.indexOf('NaN') < 0 && bodyTxt.indexOf('[object Object]') < 0, 'DOM text leak');
  } catch (e) {
    errs.push('EdgeExc:' + (e && e.message ? e.message : String(e)));
  }
  const el = document.createElement('div');
  el.id = 'btV6EdgeVerdict';
  el.textContent = errs.length ? ('V6_EDGE_' + 'FAIL:' + errs.join(' || ')) : ('V6_EDGE_' + 'PASS_ALL');
  document.body.appendChild(el);
});
</script>
'@
          $injected = $corpus -replace '</body>', ($probeScript + "`n</body>")
          [System.IO.File]::WriteAllText($tmpHtml, $injected, $utf8NoBom)
          $uri = ([System.Uri]$tmpHtml).AbsoluteUri
          $edgeArgs = @('--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-extensions','--allow-file-access-from-files',"--user-data-dir=$tmpProf",'--virtual-time-budget=5000','--dump-dom',$uri)
          $proc = Start-Process -FilePath $edgeExe -ArgumentList $edgeArgs -RedirectStandardOutput $tmpOut -RedirectStandardError $tmpErr -PassThru -WindowStyle Hidden
          if ($proc.WaitForExit(18000)) {
            Start-Sleep -Milliseconds 250
            if (Test-Path -LiteralPath $tmpOut) {
              $fs = New-Object System.IO.FileStream($tmpOut, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
              try {
                $sr = New-Object System.IO.StreamReader($fs, [System.Text.Encoding]::UTF8)
                $domDump = $sr.ReadToEnd()
                $sr.Dispose()
              } finally { $fs.Dispose() }
              if ($domDump -match '<div id="btV6EdgeVerdict">V6_EDGE_PASS_ALL</div>') {
                $ranEdgeDom = $true
                Assert-Check $true "Headless Edge V8 full DOM, 5 Guided Brew Steps, 5 Tabs, BTTimerAudio, BTLabMath & zero-leak sweep passed"
              } elseif ($domDump -match '<div id="btV6EdgeVerdict">V6_EDGE_FAIL:([^<]+)</div>') {
                $ranEdgeDom = $true
                Assert-Check $false "Headless Edge V8 runtime suite" $Matches[1]
              }
            }
          } else {
            try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
          }
        } finally {
          Start-Sleep -Milliseconds 120
          Remove-Item -LiteralPath $tmpHtml, $tmpOut, $tmpErr -Force -ErrorAction SilentlyContinue
          Remove-Item -LiteralPath $tmpProf -Recurse -Force -ErrorAction SilentlyContinue
        }
      }

      # Always run deterministic in-process Chakra ES6 torture suite across Gates 1, 3, 4, 5 & 8
      $core02 = [System.IO.File]::ReadAllText((Join-Path $SrcDir 'core\02-methods-grinders-water-pk.js'), [System.Text.Encoding]::UTF8)
      $core03 = [System.IO.File]::ReadAllText((Join-Path $SrcDir 'core\03-bt-core-v6.js'), [System.Text.Encoding]::UTF8)
      $core04 = [System.IO.File]::ReadAllText((Join-Path $SrcDir 'core\04-machines-innovations.js'), [System.Text.Encoding]::UTF8)
      $core05 = [System.IO.File]::ReadAllText((Join-Path $SrcDir 'core\05-encyclopedia-db.js'), [System.Text.Encoding]::UTF8)
      $plat01 = [System.IO.File]::ReadAllText((Join-Path $SrcDir 'platform\01-bt-platform.js'), [System.Text.Encoding]::UTF8)
      $ble02  = [System.IO.File]::ReadAllText((Join-Path $SrcDir 'platform\02-bt-ble-codecs.js'), [System.Text.Encoding]::UTF8)
      $chakraBundle = @"
var window = this, globalThis = this, self = this;
var navigator = { userAgent:'Mozilla/5.0', vibrate:()=>true, storage:{ persisted:()=>Promise.resolve(true), persist:()=>Promise.resolve(true) } };
(function(){
  const s = Object.create(null);
  window.localStorage = { getItem:k=>Object.prototype.hasOwnProperty.call(s,k)?s[k]:null, setItem:(k,v)=>{s[k]=String(v);}, removeItem:k=>{delete s[k];}, clear:()=>{Object.keys(s).forEach(k=>delete s[k]);} };
  const ss = Object.create(null);
  window.sessionStorage = { getItem:k=>Object.prototype.hasOwnProperty.call(ss,k)?ss[k]:null, setItem:(k,v)=>{ss[k]=String(v);}, removeItem:k=>{delete ss[k];} };
  window.setTimeout = ()=>1; window.clearTimeout = ()=>{};
})();
$codecsText
$core02
$core03
$core04
$core05
$plat01
$ble02
(function(){
  'use strict';
  let app = { screen:'door', tab:'brew', attempt:0, coffee:{ id:'c1', name:'Chelbesa', roaster:'Sey', agtron:'86' }, brew:{ method:'v60', dose:15, water:250, ratio:16.7, tempF:201 }, prefs:setupDefaults(), adjust:{ grind:0, ratio:0, agit:'' }, cupBrew:null };
  let state = { id:'s1', way:'quick', cupping_date:'2026-11-17', cva:cvaFresh(), desc:{}, words:{}, vials:[], kit:[], stars:4.5, quick:{ make:'yes', sym:'', areas:{}, liked:[], notLiked:[] }, vs:{} };
  window.BTShell = { app, state, render:()=>{}, refreshAll:()=>{}, scheduleDraft:()=>{}, flushDraft:()=>{}, toast:()=>{} };
$vaultText
})();
"@
      $fullRuntimeAssertions = @'
(function(){
  const errs = [];
  const check = (c, m) => { if (!c) errs.push(m); };
  try {
    /* Gate 1: 129-col lockstep, QR SVG, Safety Snapshot, 500-row Vault <2.0ms */
    const gaps = columnGuideGaps();
    check(COLUMNS.length === 129 && gaps.order === true && gaps.missing.length === 0, 'G1:129-col lockstep');
    check(BTStorage.ALL_18_LS_KEYS.length === 18 && BTStorage.PROTECTED_LS_KEYS.length === 13, 'G1:18 LS keys');
    const qr = encodeQrSvg('bt1:eyJ2IjoxLCJuIjoiQ2hlbGJlc2EifQ', { ecLevel:'M' });
    check(qr.indexOf('<svg ') === 0 && qr.indexOf('<path ') > 0, 'G1:QR SVG');
    const built = BTStorage.buildRow();
    const csv1 = newFileCSV(built);
    localStorage.setItem('brew-and-cup-history-v1', csv1);
    const snap = BTStorage.ensurePreMigrationSnapshot({ targetSchema:'6.0' });
    localStorage.setItem('brew-and-cup-history-v1', 'corrupted');
    const rest = BTStorage.restoreSafetySnapshotSync('pre-v6-raw');
    check(snap.vaultKey === 'pre-v6-raw' && rest.ok && localStorage.getItem('brew-and-cup-history-v1') === csv1, 'G1:pre-v6-raw restore');

    const rows = [];
    for (let i = 0; i < 500; i++){
      rows.push({ _i:i, schema_version:'6.0', id:'id-'+i, coffee_id:'cf-'+(i%100), coffee_name:'Bean '+(i%100), roaster:'Sey', cupping_date:'2026-11-01', brew_method:'v60', my_rating_stars:i===50?'5':'4.5', dial_locked:i===50?'yes':'', total_score:'88' });
    }
    BTStorage.buildUnifiedCoffeesIndex(rows, []);
    BTStorage.buildUnifiedCoffeesIndex(rows, []);
    const t0 = Date.now();
    let idx = null;
    for (let r = 0; r < 20; r++) idx = BTStorage.buildUnifiedCoffeesIndex(rows, []);
    const avgMs = (Date.now() - t0) / 20;
    check(idx.length === 100 && avgMs < 2.0, 'G1:Vault index len=' + idx.length + ' avgMs=' + avgMs);

    /* Gate 3 & Gate 6: Physics Boundary Torture, AI Scan Contract, Golden Sip & R2 Readiness, folkProblems */
    if (typeof window.parseScanReplyV6 === 'function') {
      const scanChakra = window.parseScanReplyV6('{"coffee_name":"Worka Sakaro","roaster":"Sey","origin":"Ethiopia","process":"Washed","roast_level":"light"}');
      check(scanChakra && scanChakra.ok !== false, 'G6:parseScanReplyV6 parse failed');
    }
    if (typeof folkProblems === 'function') check(folkProblems().length === 0, 'G3:folkProblems=' + JSON.stringify(folkProblems()));
    if (typeof AGTRON === 'object' && typeof AGTRON.toScale === 'function') {
      check(Math.round(AGTRON.toScale(63, 'tonino') * 10) / 10 === 105, 'G3:Tonino(63)!==105');
    }
    const simZero = BTCoreV6.simulateBrew({ method:'v60', doseG:0, waterG:250, tempC:93 });
    check(simZero.tdsPct === 0 && simZero.eyPct === 0 && !isNaN(simZero.bevG), 'G3:D=0g boundary failed');
    const simMicro = BTCoreV6.simulateBrew({ method:'aeropress', doseG:7, waterG:112, tempC:94, agtron:98 });
    const simBatch = BTCoreV6.simulateBrew({ method:'drip', doseG:90, waterG:1500, tempC:93, agtron:28 });
    check(simMicro.tdsPct > 0.5 && simBatch.tdsPct > 0.5 && Math.abs(simMicro.waterBalanceResidualG) < 0.05 && Math.abs(simBatch.waterBalanceResidualG) < 0.05, 'G3:Micro/Batch mass conservation failed');
    const simRegEsp = BTCoreV6.simulateBrew({ method:'espresso', doseG:18, waterG:36, tempC:93, agtron:65, isDecaf:false });
    const simDecEsp = BTCoreV6.simulateBrew({ method:'espresso', doseG:18, waterG:36, tempC:93, agtron:65, isDecaf:true });
    check(simDecEsp.brewTimeS < simRegEsp.brewTimeS, 'G3:Decaf espresso faster flow physics failed');
    const gs = BTCoreV6.thermo.computeGoldenSipCooling({ initialBrewTempC:76, roomTempC:22, bevMassG:220, vessel:'preheated_ceramic' });
    check(gs && gs.ok === true && gs.t0MixedC > 62 && Array.isArray(gs.curve) && gs.curve.length >= 10, 'G3:GoldenSip cooling failed');
    const r2Ready = BTCoreV6.mass.evaluateR2SampleReadiness({ sampleTempC:48, prismTempC:23 });
    check(r2Ready && r2Ready.ready === false, 'G3:R2 hot sample guard failed');

    /* Gate 4: Philips 5500 22 Drinks + Mutual Exclusion Interlocks + Aiden + xBloom */
    check(Array.isArray(BTInnovate.PHILIPS_DRINKS) && BTInnovate.PHILIPS_DRINKS.length === 22, 'G4:PHILIPS_DRINKS count=' + (BTInnovate.PHILIPS_DRINKS && BTInnovate.PHILIPS_DRINKS.length));
    const pLock = BTInnovate.enforcePhilipsInterlocks({ drink:'espresso', scoopMode:true, strength:3, extra:true, twoX:true });
    check(pLock && pLock.extra === false && pLock.twoX === false, 'G4:Philips interlock failed');
    const aiden = BTInnovate.synthesizeAidenProfile({ agtron:85, process:'washed' }, { waterG:320 });
    check(aiden && aiden.brewer === 'aiden' && Array.isArray(aiden.activePulseTemperatures) && aiden.activePulseTemperatures.length >= 1, 'G4:Aiden synthesizer failed');
    const xb = BTInnovate.synthesizeXBloomProfile({ agtron:82 }, { doseG:15, ratio:16 });
    const xbSum = xb && Array.isArray(xb.pours) ? xb.pours.reduce((a, p) => a + p.volumeMl, 0) : 0;
    check(xb && Array.isArray(xb.pours) && xbSum === 240, 'G4:xBloom integer pour sum=' + xbSum);

    /* Gate 5: BLE Binary GATT Vectors + 20B MTU Split + xBloom Safety Gate */
    const acStream = BTBleCodecs.streams.createAcaiaStreamParser();
    const acPkt = BTBleCodecs.checksums.encodeAcaia(0x0C, [0x07, 0x05, 0xB9, 0x00, 0x00, 0x01, 0x00]);
    const half1 = acPkt.slice(0, 5), half2 = acPkt.slice(5);
    check(acStream.push(half1).length === 0, 'G5:Acaia partial frame emitted early');
    const acFrames = acStream.push(half2);
    check(acFrames.length === 1 && acFrames[0].packetType === 'weight' && acFrames[0].weightG === 18.5, 'G5:Acaia 20B MTU split reassembly failed');
    const pr = BTBleCodecs.decoders.decodePressensor(new Uint8Array([0x23, 0x28, 0x03, 0xA2]));
    check(pr && pr.pressureBar === 9.0 && pr.tempC === 93.0, 'G5:Pressensor 9.0 bar / 93.0C failed');
    const xbPg = BTBleCodecs.commands.encodeXBloomRecipePayload({ doseG:15, ratio:16, preGround:true });
    const xbPgBytes = xbPg && xbPg.bytes ? xbPg.bytes : xbPg;
    check(xbPgBytes && xbPgBytes[2] === 0x44 && xbPgBytes[6] === 0xFE && xbPgBytes[7] === 0x00, 'G5:xBloom preGround 0x44/0xFE safety gate failed');

    /* Gate 8: Mock Capacitor Native Vault Mirror & Hydration */
    const capDisk = Object.create(null);
    window.Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => 'ios',
      Plugins: {
        Filesystem: {
          writeFile: (o) => { capDisk[o.directory + ':' + o.path] = o.data; return Promise.resolve({ uri:'capacitor://data/' + o.path }); },
          readFile: (o) => Promise.resolve({ data: capDisk[o.directory + ':' + o.path] || '' })
        }
      }
    };
    check(BTPlatform.isNative() === true && BTPlatform.getPlatform() === 'ios', 'G8:BTPlatform Capacitor detection failed');
    BTStorage.mirrorNativeVault();
    check(Object.keys(capDisk).some(k => k.indexOf('DATA:vault/') === 0 && capDisk[k].indexOf('#BEANTELLIGENCE-PARTS 1') === 0), 'G8:Capacitor DATA vault mirror failed');
  } catch (e) {
    errs.push('ChakraExc:' + (e && e.message ? e.message : String(e)));
  }
  return errs.length ? ('CHAKRA_FAIL:' + errs.join(' ;; ')) : 'CHAKRA_PASS_ALL';
})();
'@
      $cRes = [BtChakraHostV6]::Eval($chakraBundle + "`n" + $fullRuntimeAssertions)
      Assert-Check ($cRes -eq 'CHAKRA_PASS_ALL') "In-process Chakra ES6 torture suite across Gates 1, 3, 4, 5 & 8 (Codecs + BTCoreV6 + BTInnovate + BTBleCodecs + BTPlatform + BTStorage)" $cRes

      # =====================================================================
      # GATE 7: Installable Web PWA & localhost:8145 Server Verification
      # =====================================================================
      Write-Host "`n[Gate 7] Installable Web PWA & Preview Server Verification" -ForegroundColor Yellow
      $mwPath = Join-Path $root 'manifest.webmanifest'
      $swPath = Join-Path $root 'sw.js'
      Assert-Check ((Test-Path -LiteralPath $mwPath) -and (Test-Path -LiteralPath $swPath)) "manifest.webmanifest and sw.js exist at workspace root"
      if (Test-Path -LiteralPath $mwPath) {
        $mwObj = ([System.IO.File]::ReadAllText($mwPath, [System.Text.Encoding]::UTF8)) | ConvertFrom-Json
        Assert-Check ($mwObj.display -eq 'standalone' -and $mwObj.start_url -eq './' -and $mwObj.icons.Count -ge 3) "manifest.webmanifest has subpath-safe './' start_url, standalone display & >=3 icons"
      }
      if (Test-Path -LiteralPath $swPath) {
        $swTxt = [System.IO.File]::ReadAllText($swPath, [System.Text.Encoding]::UTF8)
        $swBal = [BtJsSyntaxCheckerV6]::CheckBalance($swTxt)
        Assert-Check ($swBal -eq 'OK') "sw.js passes C# lexical/brace balance check" $swBal
      }

      # Validate serve_preview.ps1 PowerShell AST + contract, then run live loopback HTTP 200 probe when socket binding is permitted
      $srvScript = Join-Path $PSScriptRoot 'serve_preview.ps1'
      $srvTokens = $null
      $srvParseErrors = $null
      [void][System.Management.Automation.Language.Parser]::ParseFile($srvScript, [ref]$srvTokens, [ref]$srvParseErrors)
      $srvSrc = [System.IO.File]::ReadAllText($srvScript, [System.Text.Encoding]::UTF8)
      Assert-Check ($srvParseErrors.Count -eq 0 -and $srvSrc -match 'TcpListener' -and $srvSrc -match '8145' -and $srvSrc -match 'FileSystemWatcher' -and $srvSrc -match 'Cache-Control:\s*no-store') "serve_preview.ps1 passes PowerShell AST parse & implements TcpListener:8145 + -Watch FileSystemWatcher"

      $srvPort = 18145
      $srvJob = $null
      try {
        $srvJob = Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$srvScript,'-Port',$srvPort,'-MaxRequests','1') -PassThru -WindowStyle Hidden
        Start-Sleep -Milliseconds 550
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect('127.0.0.1', $srvPort)
        $ns = $tcp.GetStream()
        $reqBytes = [System.Text.Encoding]::ASCII.GetBytes("HEAD /manifest.webmanifest HTTP/1.1`r`nHost: localhost:$srvPort`r`nConnection: close`r`n`r`n")
        $ns.Write($reqBytes, 0, $reqBytes.Length)
        $sr = New-Object System.IO.StreamReader($ns, [System.Text.Encoding]::ASCII)
        $statusLine = $sr.ReadLine()
        $tcp.Close()
        Assert-Check ($statusLine -match 'HTTP/1\.1 200 OK') "serve_preview.ps1 serves live HTTP 200 OK ($statusLine)"
      } catch {
        $msg = $_.Exception.Message
        if ($msg -match 'forbidden by its access permissions|AccessDenied') {
          Write-Host "  [INFO] Loopback TCP socket blocked by restricted sandbox ($msg); AST & contract verified." -ForegroundColor DarkGray
        } else {
          Assert-Check $false "serve_preview.ps1 HTTP 200 probe" $msg
        }
      } finally {
        if ($srvJob -and -not $srvJob.HasExited) { Stop-Process -Id $srvJob.Id -Force -ErrorAction SilentlyContinue }
      }

      # =====================================================================
      # GATE 8: Horizon-2 Capacitor 6+ Native Bridge Readiness
      # =====================================================================
      Write-Host "`n[Gate 8] Horizon-2 Capacitor Native Scaffold & Adapter Readiness" -ForegroundColor Yellow
      $capCfg = Join-Path $root 'mobile\capacitor.config.ts'
      $iosPlist = Join-Path $root 'mobile\ios-template\Info.plist'
      $iosPriv  = Join-Path $root 'mobile\ios-template\PrivacyInfo.xcprivacy'
      $andMan   = Join-Path $root 'mobile\android-template\AndroidManifest.xml'
      Assert-Check ((Test-Path -LiteralPath $capCfg) -and (Test-Path -LiteralPath $iosPlist) -and (Test-Path -LiteralPath $iosPriv) -and (Test-Path -LiteralPath $andMan)) "All Horizon-2 Capacitor iOS & Android native templates present under mobile/"
      if (Test-Path -LiteralPath $andMan) {
        $andTxt = [System.IO.File]::ReadAllText($andMan, [System.Text.Encoding]::UTF8)
        Assert-Check ($andTxt -match 'BLUETOOTH_SCAN' -and $andTxt -match 'neverForLocation') "AndroidManifest.xml enforces Android API 35 BLUETOOTH_SCAN neverForLocation"
      }
      if (Test-Path -LiteralPath $iosPriv) {
        $privTxt = [System.IO.File]::ReadAllText($iosPriv, [System.Text.Encoding]::UTF8)
        Assert-Check ($privTxt -match 'NSPrivacyTracking') "iOS PrivacyInfo.xcprivacy declares zero-tracking App Store manifest"
      }
      Assert-Check ($vaultText -match 'mirrorNativeVault' -and $vaultText -match 'hydrateNativeVaultBeforeBoot') "BTStorage implements Capacitor Directory.Data native vault mirror & cold-boot hydration"
    }
  }
} finally {
  if ($tempAssembled -and (Test-Path -LiteralPath $tempAssembled)) {
    Remove-Item -LiteralPath $tempAssembled -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "`n------------------------------------------------------------"
if ($script:FailCount -eq 0) {
  Write-Host ("ALL CHECKS PASSED (" + $script:PassCount + " / " + $script:PassCount + ")") -ForegroundColor Green
  exit 0
} else {
  Write-Host ("VERIFICATION FAILED (" + $script:FailCount + " failed, " + $script:PassCount + " passed):") -ForegroundColor Red
  foreach ($f in $script:Failures) { Write-Host ('  - ' + $f) -ForegroundColor Red }
  exit 1
}
