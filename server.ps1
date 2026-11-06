$port = 8085
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server started at http://localhost:$port/"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".json" = "application/json"
}

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $urlPath = $request.Url.LocalPath.TrimStart('/')
            if ($urlPath -eq "") { $urlPath = "index.html" }

            if ($urlPath -eq "api/save_test_result" -and $request.HttpMethod -eq "POST") {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot "test_result.txt"), $body)
                $response.ContentType = "text/plain"
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes("OK")
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.OutputStream.Close()
                continue
            }

            $filePath = Join-Path $PSScriptRoot $urlPath
            if (-not (Test-Path $filePath -PathType Leaf)) {
                $publicPath = Join-Path $PSScriptRoot "public\$urlPath"
                if (Test-Path $publicPath -PathType Leaf) {
                    $filePath = $publicPath
                }
            }

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                $response.ContentType = $mime
                $response.AddHeader("Access-Control-Allow-Origin", "*")

                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("File Not Found")
                $response.ContentLength64 = $msg.Length
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
            $response.OutputStream.Close()
        } catch {
            # Client disconnected or abort, safely continue listening
        }
    }
} finally {
    $listener.Stop()
}

