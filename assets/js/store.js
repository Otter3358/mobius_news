(function () {
  "use strict";

  var STORAGE_KEY = "mobius_news_posts_v1";

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
      publishedAt: "2026-03-04T12:30:00+01:00",
      updatedAt: "2026-03-04T12:30:00+01:00",
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

  function normalizePost(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    if (!raw.id || !raw.title || !raw.content) {
      return null;
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
      publishedAt: String(raw.publishedAt || new Date().toISOString()),
      updatedAt: String(raw.updatedAt || new Date().toISOString()),
      createdAt: String(raw.createdAt || raw.updatedAt || new Date().toISOString()),
    };
  }

  function sortByDate(posts) {
    return posts.sort(function (a, b) {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }

  function normalizePosts(rawPosts) {
    if (!Array.isArray(rawPosts)) {
      return [];
    }
    var normalized = rawPosts
      .map(normalizePost)
      .filter(function (post) {
        return Boolean(post);
      });
    return sortByDate(normalized);
  }

  function readStorage() {
    var rawValue = localStorage.getItem(STORAGE_KEY);
    if (rawValue === null) {
      return [];
    }
    var parsed = parseJson(rawValue);
    return normalizePosts(parsed);
  }

  function writeStorage(posts) {
    var normalized = normalizePosts(posts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function ensurePosts() {
    var rawValue = localStorage.getItem(STORAGE_KEY);
    if (rawValue !== null) {
      var parsed = parseJson(rawValue);
      return normalizePosts(parsed);
    }
    return writeStorage(clone(DEFAULT_POSTS));
  }

  function createId() {
    return "post-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
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
    return writeStorage(posts);
  }

  function deletePost(postId) {
    var posts = ensurePosts().filter(function (post) {
      return post.id !== postId;
    });
    return writeStorage(posts);
  }

  function getPostById(postId) {
    return ensurePosts().find(function (post) {
      return post.id === postId;
    });
  }

  window.MobiusStore = {
    storageKey: STORAGE_KEY,
    ensurePosts: ensurePosts,
    loadPosts: readStorage,
    savePosts: writeStorage,
    upsertPost: upsertPost,
    deletePost: deletePost,
    getPostById: getPostById,
    createId: createId,
  };
})();
