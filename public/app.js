"use strict";

const form = document.getElementById("timer-form");
const secondsInput = document.getElementById("seconds");
const message = document.getElementById("message");
const countdownValue = document.getElementById("countdown-value");
const progressBar = document.getElementById("progress-bar");
const startTime = document.getElementById("start-time");
const endTime = document.getElementById("end-time");
const networkStatus = document.getElementById("network-status");

let intervalId;

function formatClock(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatTime(iso) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

function startCountdown(data) {
  window.clearInterval(intervalId);
  const startMs = Date.parse(data.start);
  const endMs = Date.parse(data.end);
  const durationMs = endMs - startMs;

  startTime.textContent = formatTime(data.start);
  endTime.textContent = formatTime(data.end);

  function update() {
    const remaining = Math.max(0, endMs - Date.now());
    const elapsed = Math.min(durationMs, durationMs - remaining);
    countdownValue.textContent = formatClock(remaining);
    progressBar.style.width = `${(elapsed / durationMs) * 100}%`;

    if (remaining === 0) {
      window.clearInterval(intervalId);
      message.textContent = "Время вышло.";
    }
  }

  update();
  intervalId = window.setInterval(update, 200);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "Получаем серверную метку…";

  try {
    const response = await fetch(`/api/timer?seconds=${encodeURIComponent(secondsInput.value)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Не удалось запустить таймер.");

    message.textContent = "Таймер запущен.";
    startCountdown(data);
  } catch (error) {
    message.textContent = error.message;
  }
});

function updateNetworkStatus() {
  const online = navigator.onLine;
  networkStatus.textContent = online ? "Онлайн" : "Офлайн-режим";
  networkStatus.className = `network-status ${online ? "is-online" : "is-offline"}`;
}

window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);
updateNetworkStatus();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js").catch((error) => {
    console.error("Не удалось зарегистрировать service worker:", error);
  });
}
