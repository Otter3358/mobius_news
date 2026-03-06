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

const newsFeedNode = document.querySelector("[data-news-feed]");
const newsCountNode = document.querySelector("[data-news-count]");

const formatNewsDate = (isoDate) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "дата не указана";
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const renderNewsFeed = () => {
  if (!newsFeedNode || !window.NewsStore) {
    return;
  }

  const news = window.NewsStore.loadNews();
  if (newsCountNode) {
    newsCountNode.textContent = String(news.length);
  }

  newsFeedNode.innerHTML = "";

  if (!news.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "На текущий момент публикации отсутствуют.";
    newsFeedNode.append(empty);
    return;
  }

  news.forEach((item) => {
    const article = document.createElement("article");
    article.className = "ordinance-card";

    const articleId = document.createElement("p");
    articleId.className = "article-id";
    articleId.textContent = `Статья ${item.ordinance}`;

    const title = document.createElement("h3");
    title.textContent = item.title;

    const summary = document.createElement("p");
    summary.textContent = item.summary;

    const stamp = document.createElement("p");
    stamp.className = "stamp";
    stamp.textContent = `Сектор: ${item.location} | Опубликовано: ${formatNewsDate(item.publishedAt)}`;

    article.append(articleId, title, summary, stamp);
    newsFeedNode.append(article);
  });
};

renderNewsFeed();

window.addEventListener("storage", (event) => {
  if (!window.NewsStore || event.key !== window.NewsStore.storageKey) {
    return;
  }

  renderNewsFeed();
});
