"use strict";

const path = require("node:path");
const express = require("express");

const PUBLIC_DIRECTORY = path.join(__dirname, "public");

function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.get("/api/status", (request, response) => {
    response.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/timer", (request, response) => {
    if (request.query.seconds === undefined) {
      return response.status(400).json({
        error: "Передайте длительность таймера в query-параметре seconds.",
      });
    }

    const seconds = Number(request.query.seconds);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return response.status(400).json({
        error: "Параметр seconds должен быть положительным числом.",
      });
    }

    const start = new Date();
    const end = new Date(start.getTime() + seconds * 1000);

    return response.json({
      start: start.toISOString(),
      end: end.toISOString(),
      durationSeconds: seconds,
    });
  });

  app.get("/about", (request, response) => {
    response.sendFile(path.join(PUBLIC_DIRECTORY, "about.html"));
  });

  app.use(express.static(PUBLIC_DIRECTORY));

  app.use((request, response) => {
    response.status(404).json({ error: "Маршрут не найден." });
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createApp().listen(port, () => {
    console.log(`Сервер запущен: http://localhost:${port}`);
  });
}

module.exports = { createApp };
