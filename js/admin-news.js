const adminNewsApp = document.querySelector("[data-news-admin-app]");

if (adminNewsApp && window.NewsStore) {
  const form = adminNewsApp.querySelector("[data-news-form]");
  const listNode = adminNewsApp.querySelector("[data-news-list]");
  const messageNode = adminNewsApp.querySelector("[data-news-message]");
  const countNode = adminNewsApp.querySelector("[data-news-admin-count]");
  const resetButton = adminNewsApp.querySelector("[data-news-reset]");
  const formTitleNode = adminNewsApp.querySelector("[data-form-title]");
  const submitButton = form?.querySelector('button[type="submit"]');

  const DEFAULT_FORM_TITLE = "Публикация нового материала";
  const DEFAULT_SUBMIT_TEXT = "Сохранить новость";

  const toInputDateValue = (isoValue) => {
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return shifted.toISOString().slice(0, 16);
  };

  const toDisplayDateValue = (isoValue) => {
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) {
      return "Дата не указана";
    }

    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const setMessage = (text, kind) => {
    if (!messageNode) {
      return;
    }

    messageNode.textContent = text;
    messageNode.classList.remove("error", "ok");
    if (kind) {
      messageNode.classList.add(kind);
    }
  };

  const setDefaultPublishDate = () => {
    const input = form?.elements?.published_at;
    if (input && !input.value) {
      input.value = toInputDateValue(new Date().toISOString());
    }
  };

  const clearEditState = () => {
    if (!form) {
      return;
    }

    form.elements.news_id.value = "";
    formTitleNode.textContent = DEFAULT_FORM_TITLE;
    submitButton.textContent = DEFAULT_SUBMIT_TEXT;
    setDefaultPublishDate();
  };

  const beginEditState = (newsItem) => {
    form.elements.news_id.value = newsItem.id;
    form.elements.title.value = newsItem.title;
    form.elements.location.value = newsItem.location;
    form.elements.ordinance.value = newsItem.ordinance;
    form.elements.summary.value = newsItem.summary;
    form.elements.published_at.value = toInputDateValue(newsItem.publishedAt);
    formTitleNode.textContent = "Редактирование материала";
    submitButton.textContent = "Обновить новость";
    setMessage(`Вы редактируете: ${newsItem.title}`, "ok");
  };

  const renderNewsList = () => {
    const news = window.NewsStore.loadNews();
    countNode.textContent = `${news.length}`;

    listNode.innerHTML = "";
    if (!news.length) {
      const empty = document.createElement("p");
      empty.className = "empty-note";
      empty.textContent = "Реестр пуст. Опубликуйте первый материал.";
      listNode.append(empty);
      return;
    }

    news.forEach((item) => {
      const article = document.createElement("article");
      article.className = "admin-news-item";
      article.dataset.newsId = item.id;

      const ordinanceNode = document.createElement("p");
      ordinanceNode.className = "article-id";
      ordinanceNode.textContent = `Постановление ${item.ordinance}`;

      const titleNode = document.createElement("h4");
      titleNode.textContent = item.title;

      const summaryNode = document.createElement("p");
      summaryNode.textContent = item.summary;

      const metaNode = document.createElement("p");
      metaNode.className = "key-value";
      metaNode.textContent = `Сектор: ${item.location} | Публикация: ${toDisplayDateValue(item.publishedAt)}`;

      const actionRow = document.createElement("div");
      actionRow.className = "item-actions";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "btn";
      editButton.dataset.action = "edit";
      editButton.dataset.newsId = item.id;
      editButton.textContent = "Редактировать";

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "btn secondary";
      removeButton.dataset.action = "delete";
      removeButton.dataset.newsId = item.id;
      removeButton.textContent = "Удалить";

      actionRow.append(editButton, removeButton);
      article.append(ordinanceNode, titleNode, summaryNode, metaNode, actionRow);
      listNode.append(article);
    });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = String(form.elements.title.value || "").trim();
    const location = String(form.elements.location.value || "").trim();
    const ordinance = String(form.elements.ordinance.value || "").trim();
    const summary = String(form.elements.summary.value || "").trim();
    const publishRaw = String(form.elements.published_at.value || "").trim();
    const editingId = String(form.elements.news_id.value || "").trim();

    if (!title || !location || !ordinance || !summary || !publishRaw) {
      setMessage("Все поля обязательны для заполнения.", "error");
      return;
    }

    const publishDate = new Date(publishRaw);
    if (Number.isNaN(publishDate.getTime())) {
      setMessage("Некорректные дата и время публикации.", "error");
      return;
    }

    const prepared = {
      id: editingId || window.NewsStore.createId(),
      title,
      location,
      ordinance,
      summary,
      publishedAt: publishDate.toISOString()
    };

    const currentNews = window.NewsStore.loadNews();
    const nextNews = editingId
      ? currentNews.map((item) => (item.id === editingId ? prepared : item))
      : [...currentNews, prepared];

    window.NewsStore.saveNews(nextNews);
    renderNewsList();

    form.reset();
    clearEditState();
    setMessage(editingId ? "Материал успешно обновлён." : "Материал опубликован.", "ok");
  });

  listNode.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) {
      return;
    }

    const action = actionButton.dataset.action;
    const newsId = actionButton.dataset.newsId;
    const currentNews = window.NewsStore.loadNews();
    const selectedItem = currentNews.find((item) => item.id === newsId);

    if (!selectedItem) {
      setMessage("Материал не найден, обновите страницу.", "error");
      return;
    }

    if (action === "edit") {
      beginEditState(selectedItem);
      return;
    }

    if (action === "delete") {
      const approved = window.confirm(`Удалить материал «${selectedItem.title}»?`);
      if (!approved) {
        return;
      }

      const filtered = currentNews.filter((item) => item.id !== newsId);
      window.NewsStore.saveNews(filtered);
      renderNewsList();

      if (form.elements.news_id.value === newsId) {
        form.reset();
        clearEditState();
      }

      setMessage("Материал удалён из реестра.", "ok");
    }
  });

  resetButton.addEventListener("click", () => {
    form.reset();
    clearEditState();
    setMessage("Форма очищена.", "ok");
  });

  setDefaultPublishDate();
  clearEditState();
  renderNewsList();
}
