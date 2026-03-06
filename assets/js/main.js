(function () {
  "use strict";

  var activeTabId = "main";
  var tabsCache = [];

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

  function getTabName(tabId) {
    var tab = tabsCache.find(function (item) {
      return item.id === tabId;
    });
    return tab ? tab.label : tabId;
  }

  function selectedTabFromQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("tab") || "main";
  }

  function updateQueryTab(tabId) {
    var url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  function buildArticleUrl(postId) {
    return (
      "article.html?id=" +
      encodeURIComponent(postId) +
      "&tab=" +
      encodeURIComponent(activeTabId)
    );
  }

  function createStoryLink(post, level) {
    var link = document.createElement("a");
    link.href = buildArticleUrl(post.id);
    link.className = "story-link";
    link.textContent = post.title;

    if (level === 2) {
      var h2 = document.createElement("h2");
      h2.appendChild(link);
      return h2;
    }

    var h3 = document.createElement("h3");
    h3.appendChild(link);
    return h3;
  }

  function createMeta(post) {
    var meta = document.createElement("div");
    meta.className = "story-meta";

    var categoryTag = document.createElement("span");
    categoryTag.className = "story-tag";
    categoryTag.textContent = post.category || "Новости";
    meta.appendChild(categoryTag);

    var tabTags = document.createElement("span");
    tabTags.className = "story-tabs";
    tabTags.textContent = (post.tabs || [])
      .map(function (tabId) {
        return getTabName(tabId);
      })
      .slice(0, 2)
      .join(", ");
    if (tabTags.textContent) {
      meta.appendChild(tabTags);
    }

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
    body.appendChild(createStoryLink(post, 2));

    var summary = document.createElement("p");
    summary.className = "story-summary";
    summary.textContent = post.summary || excerpt(post);
    body.appendChild(summary);

    var content = document.createElement("p");
    content.className = "story-content";
    content.textContent = post.content;
    body.appendChild(content);

    var readLink = document.createElement("a");
    readLink.className = "story-read-more";
    readLink.href = buildArticleUrl(post.id);
    readLink.textContent = "Открыть новость";
    body.appendChild(readLink);

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
    body.appendChild(createStoryLink(post, 3));

    var text = document.createElement("p");
    text.textContent = excerpt(post);
    body.appendChild(text);

    var readLink = document.createElement("a");
    readLink.className = "story-read-more";
    readLink.href = buildArticleUrl(post.id);
    readLink.textContent = "Читать полностью";
    body.appendChild(readLink);

    card.appendChild(body);
    return card;
  }

  function filterPostsByTab(posts) {
    if (activeTabId === "feed") {
      return posts;
    }
    return posts.filter(function (post) {
      return Array.isArray(post.tabs) && post.tabs.indexOf(activeTabId) !== -1;
    });
  }

  function renderLatestList(posts) {
    var list = document.getElementById("latest-list");
    if (!list) {
      return;
    }
    list.innerHTML = "";

    if (!posts.length) {
      var empty = document.createElement("li");
      empty.className = "empty-panel";
      empty.textContent = "Для выбранной вкладки публикаций пока нет.";
      list.appendChild(empty);
      return;
    }

    posts.slice(0, 6).forEach(function (post) {
      var item = document.createElement("li");

      var title = document.createElement("a");
      title.className = "latest-item-title story-link";
      title.href = buildArticleUrl(post.id);
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
      empty.textContent = "В этой вкладке пока нет дополнительных материалов.";
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
      empty.textContent = "По вкладке \"" + getTabName(activeTabId) + "\" пока нет материалов.";
      top.appendChild(empty);
      return;
    }
    top.appendChild(createLeadStory(posts[0]));
  }

  function renderPanelTitles() {
    var activeTabName = getTabName(activeTabId);

    var updatesHeading = document.querySelector("#latest-updates h2");
    if (updatesHeading) {
      updatesHeading.textContent = activeTabName === "Срочно" ? "Срочные бюллетени" : "Последние бюллетени";
    }

    var feedHeading = document.querySelector("#news-feed .panel-heading h2");
    if (feedHeading) {
      feedHeading.textContent = activeTabName === "Лента" ? "Лента новостей" : "Лента: " + activeTabName;
    }
  }

  function renderTabs() {
    var tabNav = document.getElementById("tab-nav");
    if (!tabNav) {
      return;
    }
    tabNav.innerHTML = "";

    tabsCache.forEach(function (tab) {
      var item = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.className = "tab-button";
      if (tab.id === activeTabId) {
        button.classList.add("active");
      }
      button.dataset.tabId = tab.id;
      button.textContent = tab.label;
      item.appendChild(button);
      tabNav.appendChild(item);
    });
  }

  function syncActiveTab(tabs) {
    var desiredTabId = selectedTabFromQuery();
    var exists = tabs.some(function (tab) {
      return tab.id === desiredTabId;
    });
    if (exists) {
      activeTabId = desiredTabId;
      return;
    }
    activeTabId = tabs.length ? tabs[0].id : "main";
  }

  function renderPage() {
    renderCurrentDate();
    tabsCache = window.MobiusStore.ensureTabs();
    syncActiveTab(tabsCache);
    updateQueryTab(activeTabId);
    renderTabs();
    renderPanelTitles();

    var posts = window.MobiusStore.ensurePosts();
    var filteredPosts = filterPostsByTab(posts);
    renderTopStory(filteredPosts);
    renderLatestList(filteredPosts);
    renderFeed(filteredPosts);
  }

  function handleTabClick(event) {
    var button = event.target.closest("button[data-tab-id]");
    if (!button) {
      return;
    }
    activeTabId = button.dataset.tabId;
    updateQueryTab(activeTabId);
    renderPage();
  }

  function init() {
    var tabNav = document.getElementById("tab-nav");
    if (tabNav) {
      tabNav.addEventListener("click", handleTabClick);
    }
    renderPage();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("storage", renderPage);
})();
