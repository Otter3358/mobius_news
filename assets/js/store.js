(function () {
  "use strict";

  var POSTS_KEY = "mobius_news_posts_v1";
  var TABS_KEY = "mobius_news_tabs_v1";

  var DEFAULT_TABS = [
    { id: "main", label: "Главное", slug: "main", locked: true, order: 0 },
    { id: "urgent", label: "Срочно", slug: "urgent", locked: true, order: 1 },
    { id: "feed", label: "Лента", slug: "feed", locked: true, order: 2 },
    { id: "rumors", label: "Слухи", slug: "rumors", locked: true, order: 3 },
  ];

  var PLACEHOLDER_IMAGE =
    "data:image/svg+xml," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 630'>" +
        "<defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>" +
        "<stop offset='0' stop-color='#112f45'/><stop offset='1' stop-color='#4f7694'/>" +
        "</linearGradient></defs>" +
        "<rect width='1200' height='630' fill='url(#bg)'/>" +
        "<g fill='none' stroke='rgba(255,255,255,.22)' stroke-width='2'>" +
        "<circle cx='210' cy='160' r='120'/><circle cx='980' cy='300' r='170'/>" +
        "<rect x='110' y='360' width='340' height='140' rx='14'/>" +
        "</g>" +
        "<text x='70' y='540' fill='white' font-family='Verdana, sans-serif' font-size='54' font-weight='700'>G.U.N. PRESS VISUAL</text>" +
        "</svg>",
    );

  var DEFAULT_POSTS = [
    {
      id: "seed-briefing-1",
      title: "G.U.N. усиливает патрулирование в Центральном Сити после всплеска энергии Хаоса",
      summary:
        "Оперативный центр подтвердил расширение маршрутов воздушного наблюдения. Ограничения для гражданских перевозок не вводились.",
      content:
        "По итогам утреннего брифинга командование G.U.N. подтвердило, что в Центральном Сити зафиксированы кратковременные энергетические колебания. Для исключения рисков задействованы дополнительные патрульные экипажи и мобильные аналитические группы. В штабе уточнили, что обстановка остается управляемой, а ключевые транспортные узлы работают в штатном режиме. Гражданам рекомендовано следовать официальным предупреждениям диспетчерских служб.",
      category: "Безопасность",
      location: "Центральный Сити",
      image: PLACEHOLDER_IMAGE,
      imageAlt: "Оперативный брифинг G.U.N.",
      imageCaption: "Архив пресс-бюро G.U.N.",
      tabs: ["main", "urgent"],
      publishedAt: "2026-03-06T08:25:00+01:00",
      updatedAt: "2026-03-06T08:25:00+01:00",
    },
    {
      id: "seed-briefing-2",
      title: "Скоростной коридор Sky Route открыт после полной проверки инфраструктуры",
      summary:
        "Транспортная администрация возобновила движение на северном участке после совместных испытаний с инженерными подразделениями.",
      content:
        "Sky Route снова доступен для регулярных рейсов и грузовых платформ. По данным дорожного департамента, за последние 48 часов были обновлены опоры безопасности и повторно настроены интеллектуальные датчики ветровой нагрузки. В случае резкого изменения погоды система автоматически ограничит максимальную скорость и направит трафик на резервные маршруты.",
      category: "Транспорт",
      location: "Sky Route",
      image: PLACEHOLDER_IMAGE,
      imageAlt: "Панорама скоростного коридора",
      imageCaption: "Транспортный департамент",
      tabs: ["main"],
      publishedAt: "2026-03-05T18:10:00+01:00",
      updatedAt: "2026-03-05T18:10:00+01:00",
    },
    {
      id: "seed-briefing-3",
      title: "В южном регионе стартовал резервный протокол кольцевой поддержки",
      summary:
        "Экстренные службы получили доступ к расширенному запасу колец для быстрого реагирования на инциденты.",
      content:
        "Новая программа снабжения предусматривает распределение мобильных контейнеров с кольцевым резервом на ключевых транспортных развязках. По словам координаторов, это позволит сократить время реагирования при крупных авариях и ускорить эвакуацию жителей. Контроль за использованием запаса будет вестись в единой цифровой системе отчетности.",
      category: "Службы спасения",
      location: "Южный сектор",
      image: PLACEHOLDER_IMAGE,
      imageAlt: "Контейнеры экстренного резерва",
      imageCaption: "Региональный штаб спасательных служб",
      tabs: ["feed"],
      publishedAt: "2026-03-04T12:30:00+01:00",
      updatedAt: "2026-03-04T12:30:00+01:00",
    },
    {
      id: "seed-briefing-4",
      title: "Наблюдатели фиксируют непроверенные сообщения о новом изумрудном сигнале",
      summary:
        "Аналитики отмечают рост неподтвержденных заявлений в восточных секторах. Официальная проверка продолжается.",
      content:
        "В информационный центр поступила серия сообщений о всплесках, похожих на сигнатуру изумрудной энергии. На текущий момент часть данных не подтверждена, поэтому публикация перемещена в раздел предварительных наблюдений. Специалисты G.U.N. проводят перекрестную верификацию с полевыми датчиками и обещают обновить сводку после завершения анализа.",
      category: "Технологии",
      location: "Восточный сектор",
      image: PLACEHOLDER_IMAGE,
      imageAlt: "Панель аналитического мониторинга",
      imageCaption: "Аналитическая группа наблюдения",
      tabs: ["rumors"],
      publishedAt: "2026-03-03T15:45:00+01:00",
      updatedAt: "2026-03-03T15:45:00+01:00",
    },
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function parseJson(value) {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return null;
    }
  }

  function uniqueStrings(values) {
    var result = [];
    if (!Array.isArray(values)) {
      return result;
    }
    values.forEach(function (value) {
      var stringValue = String(value || "").trim();
      if (stringValue && result.indexOf(stringValue) === -1) {
        result.push(stringValue);
      }
    });
    return result;
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  }

  function createId(prefix) {
    var scopedPrefix = prefix || "post";
    return scopedPrefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function normalizeTab(raw, fallbackOrder) {
    if (!raw || typeof raw !== "object" || !raw.id || !raw.label) {
      return null;
    }
    var label = String(raw.label).trim();
    if (!label) {
      return null;
    }
    var rawOrder = Number(raw.order);
    var order = Number.isFinite(rawOrder) ? rawOrder : fallbackOrder;

    return {
      id: String(raw.id),
      label: label,
      slug: String(raw.slug || slugify(label) || String(raw.id)),
      locked: Boolean(raw.locked),
      order: order,
    };
  }

  function normalizeTabs(rawTabs) {
    var normalized = [];
    var usedIds = [];

    if (Array.isArray(rawTabs)) {
      rawTabs.forEach(function (tab, index) {
        var parsedTab = normalizeTab(tab, index);
        if (!parsedTab || usedIds.indexOf(parsedTab.id) !== -1) {
          return;
        }
        normalized.push(parsedTab);
        usedIds.push(parsedTab.id);
      });
    }

    DEFAULT_TABS.forEach(function (defaultTab) {
      var existingIndex = normalized.findIndex(function (tab) {
        return tab.id === defaultTab.id;
      });
      if (existingIndex === -1) {
        normalized.push(clone(defaultTab));
      } else {
        normalized[existingIndex] = {
          id: defaultTab.id,
          label: defaultTab.label,
          slug: defaultTab.slug,
          locked: true,
          order: defaultTab.order,
        };
      }
    });

    normalized.sort(function (a, b) {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.label.localeCompare(b.label, "ru-RU");
    });

    return normalized.map(function (tab, index) {
      return {
        id: tab.id,
        label: tab.label,
        slug: tab.slug,
        locked: tab.locked,
        order: index,
      };
    });
  }

  function readTabs() {
    var rawValue = localStorage.getItem(TABS_KEY);
    if (rawValue === null) {
      return [];
    }
    return normalizeTabs(parseJson(rawValue));
  }

  function writeTabs(tabs) {
    var normalized = normalizeTabs(tabs);
    localStorage.setItem(TABS_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function ensureTabs() {
    var rawValue = localStorage.getItem(TABS_KEY);
    if (rawValue === null) {
      return writeTabs(clone(DEFAULT_TABS));
    }
    var normalized = normalizeTabs(parseJson(rawValue));
    localStorage.setItem(TABS_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function getTabById(tabId) {
    return ensureTabs().find(function (tab) {
      return tab.id === tabId;
    });
  }

  function createTab(label) {
    var preparedLabel = String(label || "").trim();
    if (!preparedLabel) {
      throw new Error("Tab label is required.");
    }

    var tabs = ensureTabs();
    var duplicate = tabs.find(function (tab) {
      return tab.label.toLowerCase() === preparedLabel.toLowerCase();
    });
    if (duplicate) {
      throw new Error("Tab already exists.");
    }

    var nextOrder = tabs.length;
    tabs.push({
      id: createId("tab"),
      label: preparedLabel,
      slug: slugify(preparedLabel) || createId("slug"),
      locked: false,
      order: nextOrder,
    });
    return writeTabs(tabs);
  }

  function normalizePost(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    if (!raw.id || !raw.title || !raw.content) {
      return null;
    }

    var tabIds = uniqueStrings(raw.tabs);
    if (!tabIds.length) {
      tabIds = ["main"];
    }

    return {
      id: String(raw.id),
      title: String(raw.title),
      summary: String(raw.summary || ""),
      content: String(raw.content),
      category: String(raw.category || "Без категории"),
      location: String(raw.location || "Не указано"),
      image: String(raw.image || ""),
      imageAlt: String(raw.imageAlt || ""),
      imageCaption: String(raw.imageCaption || ""),
      tabs: tabIds,
      publishedAt: String(raw.publishedAt || new Date().toISOString()),
      updatedAt: String(raw.updatedAt || new Date().toISOString()),
      createdAt: String(raw.createdAt || raw.updatedAt || new Date().toISOString()),
    };
  }

  function sortPostsByDate(posts) {
    return posts.sort(function (a, b) {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }

  function normalizePosts(rawPosts) {
    if (!Array.isArray(rawPosts)) {
      return [];
    }
    return sortPostsByDate(
      rawPosts
        .map(normalizePost)
        .filter(function (post) {
          return Boolean(post);
        }),
    );
  }

  function readPosts() {
    var rawValue = localStorage.getItem(POSTS_KEY);
    if (rawValue === null) {
      return [];
    }
    return normalizePosts(parseJson(rawValue));
  }

  function writePosts(posts) {
    var normalized = normalizePosts(posts);
    localStorage.setItem(POSTS_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function ensurePosts() {
    var rawValue = localStorage.getItem(POSTS_KEY);
    if (rawValue !== null) {
      return normalizePosts(parseJson(rawValue));
    }
    return writePosts(clone(DEFAULT_POSTS));
  }

  function upsertPost(post) {
    var normalized = normalizePost(post);
    if (!normalized) {
      throw new Error("Invalid post payload.");
    }
    var posts = ensurePosts();
    var index = posts.findIndex(function (item) {
      return item.id === normalized.id;
    });
    if (index === -1) {
      posts.push(normalized);
    } else {
      posts[index] = normalized;
    }
    return writePosts(posts);
  }

  function deletePost(postId) {
    var posts = ensurePosts().filter(function (post) {
      return post.id !== postId;
    });
    return writePosts(posts);
  }

  function getPostById(postId) {
    return ensurePosts().find(function (post) {
      return post.id === postId;
    });
  }

  function deleteTab(tabId) {
    var tabs = ensureTabs();
    var tab = tabs.find(function (item) {
      return item.id === tabId;
    });

    if (!tab) {
      return tabs;
    }
    if (tab.locked) {
      throw new Error("Default tab cannot be removed.");
    }

    var remainingTabs = tabs.filter(function (item) {
      return item.id !== tabId;
    });
    writeTabs(remainingTabs);

    var updatedPosts = ensurePosts().map(function (post) {
      var filteredTabs = post.tabs.filter(function (id) {
        return id !== tabId;
      });
      if (!filteredTabs.length) {
        filteredTabs = ["main"];
      }
      return {
        id: post.id,
        title: post.title,
        summary: post.summary,
        content: post.content,
        category: post.category,
        location: post.location,
        image: post.image,
        imageAlt: post.imageAlt,
        imageCaption: post.imageCaption,
        tabs: filteredTabs,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        createdAt: post.createdAt,
      };
    });
    writePosts(updatedPosts);

    return ensureTabs();
  }

  window.MobiusStore = {
    postsKey: POSTS_KEY,
    tabsKey: TABS_KEY,
    ensurePosts: ensurePosts,
    loadPosts: readPosts,
    savePosts: writePosts,
    upsertPost: upsertPost,
    deletePost: deletePost,
    getPostById: getPostById,
    ensureTabs: ensureTabs,
    loadTabs: readTabs,
    saveTabs: writeTabs,
    createTab: createTab,
    deleteTab: deleteTab,
    getTabById: getTabById,
    createId: createId,
  };
})();
