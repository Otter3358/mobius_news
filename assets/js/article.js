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

  function getQuery() {
    return new URLSearchParams(window.location.search);
  }

  function makeBackUrl(tabId) {
    if (!tabId) {
      return "index.html";
    }
    return "index.html?tab=" + encodeURIComponent(tabId);
  }

  function makeArticleUrl(postId, tabId) {
    var url = "article.html?id=" + encodeURIComponent(postId);
    if (tabId) {
      url += "&tab=" + encodeURIComponent(tabId);
    }
    return url;
  }

  function renderNotFound(articleRoot, tabId) {
    articleRoot.innerHTML = "";
    var block = document.createElement("div");
    block.className = "empty-panel";
    block.textContent = "Публикация не найдена или была удалена.";
    articleRoot.appendChild(block);

    var back = document.getElementById("back-to-news");
    if (back) {
      back.href = makeBackUrl(tabId);
      back.textContent = "Вернуться к вкладкам новостей";
    }
  }

  function renderArticle(post, articleRoot) {
    articleRoot.innerHTML = "";

    var header = document.createElement("header");
    header.className = "article-header";

    var meta = document.createElement("div");
    meta.className = "story-meta";

    var category = document.createElement("span");
    category.className = "story-tag";
    category.textContent = post.category || "Новости";
    meta.appendChild(category);

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

    header.appendChild(meta);

    var title = document.createElement("h2");
    title.className = "article-title";
    title.textContent = post.title;
    header.appendChild(title);

    var summary = document.createElement("p");
    summary.className = "article-summary";
    summary.textContent = post.summary || "";
    header.appendChild(summary);

    articleRoot.appendChild(header);

    if (post.image) {
      var figure = document.createElement("figure");
      figure.className = "article-media";

      var image = document.createElement("img");
      image.src = post.image;
      image.alt = post.imageAlt || post.title || "Иллюстрация публикации";
      figure.appendChild(image);

      if (post.imageCaption) {
        var caption = document.createElement("figcaption");
        caption.textContent = post.imageCaption;
        figure.appendChild(caption);
      }

      articleRoot.appendChild(figure);
    }

    var content = document.createElement("div");
    content.className = "article-text";

    var chunks = String(post.content || "")
      .split(/\n+/)
      .map(function (line) {
        return line.trim();
      })
      .filter(function (line) {
        return Boolean(line);
      });

    if (!chunks.length) {
      chunks = [post.summary || ""];
    }

    chunks.forEach(function (line) {
      var paragraph = document.createElement("p");
      paragraph.textContent = line;
      content.appendChild(paragraph);
    });

    articleRoot.appendChild(content);
  }

  function renderRelated(currentPostId, activeTabId) {
    var listNode = document.getElementById("related-stories");
    if (!listNode) {
      return;
    }
    listNode.innerHTML = "";

    var posts = window.MobiusStore.ensurePosts();
    var related = posts
      .filter(function (post) {
        if (post.id === currentPostId) {
          return false;
        }
        if (!activeTabId || activeTabId === "feed") {
          return true;
        }
        return Array.isArray(post.tabs) && post.tabs.indexOf(activeTabId) !== -1;
      })
      .slice(0, 4);

    if (!related.length) {
      var empty = document.createElement("p");
      empty.className = "empty-panel";
      empty.textContent = "Публикации по теме пока отсутствуют.";
      listNode.appendChild(empty);
      return;
    }

    related.forEach(function (post) {
      var card = document.createElement("article");
      card.className = "story-card";

      var body = document.createElement("div");
      body.className = "story-body";

      var title = document.createElement("h3");
      var link = document.createElement("a");
      link.className = "story-link";
      link.href = makeArticleUrl(post.id, activeTabId);
      link.textContent = post.title;
      title.appendChild(link);
      body.appendChild(title);

      var meta = document.createElement("p");
      meta.className = "latest-item-meta";
      meta.textContent = formatDate(post.publishedAt);
      body.appendChild(meta);

      card.appendChild(body);
      listNode.appendChild(card);
    });
  }

  function init() {
    renderCurrentDate();

    var query = getQuery();
    var postId = query.get("id");
    var tabId = query.get("tab") || "main";

    var back = document.getElementById("back-to-news");
    if (back) {
      back.href = makeBackUrl(tabId);
    }

    var articleRoot = document.getElementById("article-content");
    if (!articleRoot || !postId) {
      return;
    }

    window.MobiusStore.ensureTabs();
    var post = window.MobiusStore.getPostById(postId);
    if (!post) {
      renderNotFound(articleRoot, tabId);
      return;
    }

    renderArticle(post, articleRoot);
    renderRelated(post.id, tabId);

    if (post.title) {
      document.title = "Mobius Newswire | " + post.title;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
