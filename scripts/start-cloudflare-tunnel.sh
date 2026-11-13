#!/usr/bin/env bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
port="${PORT:-3006}"

if ! command -v node >/dev/null 2>&1; then
  echo "Ошибка: Node.js не найден. Установите Node.js 18 или новее." >&2
  exit 1
fi

cloudflared_bin="${CLOUDFLARED_BIN:-cloudflared}"
if ! command -v "$cloudflared_bin" >/dev/null 2>&1; then
  windows_cloudflared="/c/Program Files (x86)/cloudflared/cloudflared.exe"
  if [[ -x "$windows_cloudflared" ]]; then
    cloudflared_bin="$windows_cloudflared"
  else
    echo "Ошибка: cloudflared не найден. Установите Cloudflare Tunnel." >&2
    exit 1
  fi
fi

cd "$project_root"
PORT="$port" node server.js &
server_pid=$!

cleanup() {
  kill "$server_pid" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

for _ in {1..40}; do
  if ! kill -0 "$server_pid" >/dev/null 2>&1; then
    echo "Ошибка: Node.js-сервер завершился до запуска туннеля." >&2
    exit 1
  fi

  if curl --silent --fail "http://127.0.0.1:${port}/api/status" >/dev/null; then
    echo "Локальный сервер готов: http://127.0.0.1:${port}"
    break
  fi
  sleep 0.5
done

if ! curl --silent --fail "http://127.0.0.1:${port}/api/status" >/dev/null; then
  echo "Ошибка: сервер не ответил на порту ${port} за 20 секунд." >&2
  exit 1
fi

echo "Создаю Cloudflare Quick Tunnel. Публичная ссылка появится ниже."
"$cloudflared_bin" tunnel \
  --url "http://127.0.0.1:${port}" \
  --no-autoupdate \
  --protocol quic \
  --edge-ip-version 4
