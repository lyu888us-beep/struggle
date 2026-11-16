param([int]$Port = 4173)

# Lexio 乐词 · 免安装便携服务器
# 只监听 127.0.0.1，使用系统默认浏览器打开，关闭本窗口即退出。

$ErrorActionPreference = 'Stop'
$dir = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'assets'))

if (-not (Test-Path -LiteralPath (Join-Path $dir 'index.html'))) {
    Write-Host "[错误] 未找到 assets\index.html，请把本脚本放在 Lexio 目录下运行。" -ForegroundColor Red
    exit 1
}

$mime = @{
    '.html'       = 'text/html; charset=utf-8'
    '.js'         = 'text/javascript; charset=utf-8'
    '.css'        = 'text/css; charset=utf-8'
    '.json'       = 'application/json; charset=utf-8'
    '.webmanifest'= 'application/manifest+json; charset=utf-8'
    '.png'        = 'image/png'
    '.svg'        = 'image/svg+xml'
    '.ico'        = 'image/x-icon'
    '.md'         = 'text/plain; charset=utf-8'
}

function Send-Response {
    param($stream, [int]$status, [string]$reason, [string]$contentType, [byte[]]$body)
    $header = "HTTP/1.1 $status $reason`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
    $hb = [Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($hb, 0, $hb.Length)
    if ($body -and $body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
    $stream.Flush()
}

# 依次尝试 4173..4182 端口
$listener = $null
for ($p = $Port; $p -lt $Port + 10; $p++) {
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $p)
        $listener.Start()
        $Port = $p
        break
    } catch {
        $listener = $null
    }
}
if (-not $listener) {
    Write-Host "[错误] 4173-4182 端口均被占用。" -ForegroundColor Red
    exit 1
}

$url = "http://127.0.0.1:$Port/"
Write-Host ""
Write-Host "  Lexio 乐词 · 单机版已启动" -ForegroundColor Green
Write-Host "  地址: $url"
Write-Host "  关闭本窗口或按 Ctrl+C 即可退出。"
Write-Host ""
Start-Process $url

while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $null
    try {
        $stream = $client.GetStream()
        $reader = [IO.StreamReader]::new($stream)
        $reqLine = $reader.ReadLine()
        if (-not $reqLine) { continue }
        # 消费完请求头
        while ($true) {
            $line = $reader.ReadLine()
            if ($null -eq $line -or $line -eq '') { break }
        }

        $parts = $reqLine -split ' '
        if ($parts.Count -lt 2 -or $parts[0] -ne 'GET') {
            Send-Response $stream 405 'Method Not Allowed' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('405'))
            continue
        }

        $uriPath = [Uri]::UnescapeDataString(($parts[1] -split '\?')[0])
        if ($uriPath -eq '/' -or $uriPath -eq '') { $uriPath = '/index.html' }
        if ($uriPath -eq '/favicon.ico') { $uriPath = '/icon-512.png' }

        # 路径穿越防护
        $rel = $uriPath.TrimStart('/')
        $full = [IO.Path]::GetFullPath((Join-Path $dir $rel))
        $inside = $full.StartsWith($dir + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)

        if (-not $inside) {
            Send-Response $stream 403 'Forbidden' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Forbidden'))
        }
        elseif (Test-Path -LiteralPath $full -PathType Leaf) {
            $body = [IO.File]::ReadAllBytes($full)
            $ext = [IO.Path]::GetExtension($full).ToLower()
            $ct = $mime[$ext]
            if (-not $ct) { $ct = 'application/octet-stream' }
            Send-Response $stream 200 'OK' $ct $body
        }
        else {
            Send-Response $stream 404 'Not Found' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('404 Not Found'))
        }
    }
    catch {
        # 单个请求失败不影响整体服务
    }
    finally {
        try { if ($stream) { $stream.Close() } } catch {}
        try { $client.Close() } catch {}
    }
}
