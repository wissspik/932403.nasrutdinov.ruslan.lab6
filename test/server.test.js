"use strict";

const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../server");

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = createApp().listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("GET /api/timer возвращает серверные метки", async () => {
  const response = await fetch(`${baseUrl}/api/timer?seconds=60`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.durationSeconds, 60);
  assert.equal(Date.parse(body.end) - Date.parse(body.start), 60_000);
});

test("GET /api/timer проверяет обязательный параметр", async () => {
  const response = await fetch(`${baseUrl}/api/timer`);
  assert.equal(response.status, 400);
});

test("GET /api/timer отклоняет неположительное число", async () => {
  const response = await fetch(`${baseUrl}/api/timer?seconds=-5`);
  assert.equal(response.status, 400);
});

test("статические страницы доступны", async () => {
  assert.equal((await fetch(`${baseUrl}/`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/about`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/manifest.json`)).status, 200);
});
