# Лабораторная работа №6

Node.js, Express и PWA. Вариант 13 — «Таймер обратного отсчёта».

## Данные

- Группа: 932403
- Студент: Насрутдинов Руслан Фаилевич
- Вариант: 13

## Возможности

- Express-сервер со статическими файлами.
- Маршруты `GET /`, `GET /about`, `GET /api/status`.
- Маршрут `GET /api/timer?seconds=60` с проверкой положительного числа.
- Ответ таймера в формате `{ start, end, durationSeconds }`.
- Понятные ответы `400` для отсутствующего или некорректного параметра.
- Клиентский обратный отсчёт по серверным ISO-меткам.
- `manifest.json`, иконка и service worker для офлайн-режима.
- Автоматические тесты API.

## Запуск

```bash
npm install
npm start
```

Откройте `http://localhost:3000`.

## Cloudflare Tunnel

Текущий временный публичный адрес:

**https://voltage-phrase-condos-hottest.trycloudflare.com**

Quick Tunnel работает, пока запущены локальный Node.js-сервер и процесс `cloudflared`.
При новом запуске Cloudflare выдаёт другой адрес `trycloudflare.com`.

Перед запуском установите `cloudflared` и убедитесь, что команда доступна в `PATH`.

PowerShell:

```powershell
npm run tunnel
```

Git Bash:

```bash
bash scripts/start-cloudflare-tunnel.sh
```

Оба скрипта автоматически:

1. запускают приложение на порту `3006`;
2. проверяют локальный маршрут `/api/status`;
3. создают Cloudflare Quick Tunnel;
4. останавливают Node.js-сервер при завершении туннеля.

## Проверка

```bash
npm test
```

Пример запроса:

```bash
curl "http://localhost:3000/api/timer?seconds=60"
```
