param(
  [ValidateRange(1, 65535)]
  [int]$Port = 3006
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
  throw "Node.js не найден. Установите Node.js 18 или новее и повторите запуск."
}

$cloudflaredCommand = Get-Command cloudflared -ErrorAction SilentlyContinue
$cloudflaredPath = if ($cloudflaredCommand) {
  $cloudflaredCommand.Source
} else {
  "C:\Program Files (x86)\cloudflared\cloudflared.exe"
}

if (-not (Test-Path -LiteralPath $cloudflaredPath)) {
  throw "cloudflared не найден. Установите Cloudflare Tunnel и добавьте его в PATH."
}

$server = Start-Process `
  -FilePath $nodeCommand.Source `
  -ArgumentList "server.js" `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden `
  -Environment @{ PORT = "$Port" } `
  -PassThru

try {
  $deadline = (Get-Date).AddSeconds(20)
  $serverReady = $false

  do {
    if ($server.HasExited) {
      throw "Node.js-сервер завершился до запуска туннеля."
    }

    try {
      $response = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/api/status" -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        $serverReady = $true
        break
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  } while ((Get-Date) -lt $deadline)

  if (-not $serverReady) {
    throw "Сервер не ответил на порту $Port за 20 секунд."
  }

  Write-Host "Локальный сервер готов: http://127.0.0.1:$Port" -ForegroundColor Green
  Write-Host "Создаю Cloudflare Quick Tunnel. Публичная ссылка появится ниже." -ForegroundColor Cyan

  & $cloudflaredPath tunnel `
    --url "http://127.0.0.1:$Port" `
    --no-autoupdate `
    --protocol quic `
    --edge-ip-version 4
} finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id
  }
}
