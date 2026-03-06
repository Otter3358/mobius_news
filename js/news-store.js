const NEWS_STORAGE_KEY = "gun_sonic_news_registry_v1";

const defaultNews = [
  {
    id: "gun-01-gh",
    title: "О стабилизации обстановки в районе Green Hill",
    location: "Green Hill",
    ordinance: "01-ГХ",
    summary:
      "Подтверждён стремительный выход Соника на перехват техники Эггмана. Угроза мирным зонам снижена до допустимого уровня.",
    publishedAt: "2026-03-06T08:10:00+03:00"
  },
  {
    id: "gun-02-mr",
    title: "О контроле перемещений в районе Mystic Ruins",
    location: "Mystic Ruins",
    ordinance: "02-МВ",
    summary:
      "Предписано сохранить повышенный мониторинг перемещений изумрудных сигнатур. Отдельные каналы связи переведены в усиленный режим.",
    publishedAt: "2026-03-06T10:25:00+03:00"
  },
  {
    id: "gun-03-sc",
    title: "О координации с добровольческими группами поддержки",
    location: "Station Square",
    ordinance: "03-СК",
    summary:
      "Разрешено взаимодействие с Тейлзом и Наклзом в рамках предотвращения техногенных инцидентов и защиты мирного населения.",
    publishedAt: "2026-03-06T13:40:00+03:00"
  }
];

const normalizeNewsItem = (item) => ({
  id: String(item.id || ""),
  title: String(item.title || "").trim(),
  location: String(item.location || "").trim(),
  ordinance: String(item.ordinance || "").trim(),
  summary: String(item.summary || "").trim(),
  publishedAt: String(item.publishedAt || "")
});

const toEpoch = (isoDate) => {
  const epoch = new Date(isoDate).getTime();
  return Number.isNaN(epoch) ? 0 : epoch;
};

const sortNews = (news) => [...news].sort((a, b) => toEpoch(b.publishedAt) - toEpoch(a.publishedAt));

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `news-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const saveNews = (news) => {
  const normalized = sortNews(news.map(normalizeNewsItem));
  localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

const loadNews = () => {
  const raw = localStorage.getItem(NEWS_STORAGE_KEY);
  if (!raw) {
    return saveNews(defaultNews);
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return saveNews(defaultNews);
    }

    const normalized = parsed.map(normalizeNewsItem).filter((item) => item.title && item.summary);
    if (!normalized.length) {
      return saveNews(defaultNews);
    }

    return sortNews(normalized);
  } catch {
    return saveNews(defaultNews);
  }
};

window.NewsStore = {
  createId,
  loadNews,
  saveNews,
  storageKey: NEWS_STORAGE_KEY
};
