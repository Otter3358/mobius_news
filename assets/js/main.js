(function () {
  "use strict";

  function formatDate(isoString) {
    var date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return "Дата не указана";
    }
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function formatShortDate(isoString) {
    var date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return "Нет даты";
    }
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function renderCurrentDate() {
    var dateNode = document.getElementById("today-date");
    if (!dateNode) {
      return;
    }
    dateNode.textContent = new Intl.DateTimeFormat("ru-RU", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }

  function excerpt(post) {
    var text = post.summary || post.content || "";
    if (text.length <= 190) {
      return text;
    }
    return text.slice(0, 187).trimEnd() + "...";
  }

  function createMeta(post) {
    var meta = document.createElement("div");
    meta.className = "story-meta";

    var tag = document.createElement("span");
    tag.className = "story-tag";
    tag.textContent = post.category || "Новости";
    meta.appendChild(tag);

    var location = document.createElement("span");
    location.textContent = post.location || "Регион не указан";
    meta.appendChild(location);

    var separator = document.createElement("span");
    separator.textContent = "•";
    meta.appendChild(separator);

    var published = document.createElement("time");
    published.dateTime = post.publishedAt;
    published.textContent = formatDate(post.publishedAt);
    meta.appendChild(published);

    return meta;
  }

  function createImageFigure(post) {
    if (!post.image) {
      return null;
    }
    var figure = document.createElement("figure");
    figure.className = "story-media";

    var image = document.createElement("img");
    image.loading = "lazy";
    image.src = post.image;
    image.alt = post.imageAlt || post.title || "Иллюстрация новости";
    figure.appendChild(image);

    if (post.imageCaption) {
      var caption = document.createElement("figcaption");
      caption.textContent = post.imageCaption;
      figure.appendChild(caption);
    }

    return figure;
  }

  function createLeadStory(post) {
    var article = document.createElement("article");
    article.className = "lead-story";

    var media = createImageFigure(post);
    if (media) {
      article.appendChild(media);
    } else {
      var emptyImage = document.createElement("div");
      emptyImage.className = "story-media";
      article.appendChild(emptyImage);
    }

    var body = document.createElement("div");
    body.className = "story-body";
    body.appendChild(createMeta(post));

    var title = document.createElement("h2");
    title.textContent = post.title;
    body.appendChild(title);

    var summary = document.createElement("p");
    summary.className = "story-summary";
    summary.textContent = post.summary || excerpt(post);
    body.appendChild(summary);

    var content = document.createElement("p");
    content.className = "story-content";
    content.textContent = post.content;
    body.appendChild(content);

    article.appendChild(body);
    return article;
  }

  function createCard(post) {
    var card = document.createElement("article");
    card.className = "story-card";

    var media = createImageFigure(post);
    if (media) {
      card.appendChild(media);
    }

    var body = document.createElement("div");
    body.className = "story-body";
    body.appendChild(createMeta(post));

    var title = document.createElement("h3");
    title.textContent = post.title;
    body.appendChild(title);

    var text = document.createElement("p");
    text.textContent = excerpt(post);
    body.appendChild(text);

    card.appendChild(body);
    return card;
  }

  function renderLatestList(posts) {
    var list = document.getElementById("latest-list");
    if (!list) {
      return;
    }
    list.innerHTML = "";
    posts.slice(0, 6).forEach(function (post) {
      var item = document.createElement("li");

      var title = document.createElement("p");
      title.className = "latest-item-title";
      title.textContent = post.title;
      item.appendChild(title);

      var meta = document.createElement("p");
      meta.className = "latest-item-meta";
      meta.textContent = post.location + " • " + formatShortDate(post.publishedAt);
      item.appendChild(meta);

      list.appendChild(item);
    });
  }

  function renderFeed(posts) {
    var feed = document.getElementById("all-stories");
    if (!feed) {
      return;
    }
    feed.innerHTML = "";

    if (posts.length <= 1) {
      var empty = document.createElement("p");
      empty.className = "empty-panel";
      empty.textContent = "В ленте пока одна публикация. Следующие материалы будут добавлены редакцией.";
      feed.appendChild(empty);
      return;
    }

    posts.slice(1).forEach(function (post) {
      feed.appendChild(createCard(post));
    });
  }

  function renderTopStory(posts) {
    var top = document.getElementById("top-story");
    if (!top) {
      return;
    }
    top.innerHTML = "";
    if (!posts.length) {
      var empty = document.createElement("p");
      empty.className = "empty-panel";
      empty.textContent = "Материалы временно недоступны.";
      top.appendChild(empty);
      return;
    }
    top.appendChild(createLeadStory(posts[0]));
  }

  function renderPage() {
    renderCurrentDate();
    var posts = window.MobiusStore.ensurePosts();
    renderTopStory(posts);
    renderLatestList(posts);
    renderFeed(posts);
  }

  document.addEventListener("DOMContentLoaded", renderPage);
  window.addEventListener("storage", renderPage);
})();
