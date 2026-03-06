const currentDateNode = document.querySelector("[data-current-date]");
const updatedNode = document.querySelector("[data-updated-at]");
const statusNode = document.querySelector("[data-ops-status]");

const now = new Date();
const dateLabel = now.toLocaleDateString("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric"
});

if (currentDateNode) {
  currentDateNode.textContent = dateLabel;
}

if (updatedNode) {
  updatedNode.textContent = now.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

if (statusNode) {
  const levels = ["Статус: устойчиво", "Статус: повышенный контроль", "Статус: наблюдение"];
  statusNode.textContent = levels[now.getSeconds() % levels.length];
}
