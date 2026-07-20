export const BRAND = {
  name: 'сорвались',
  legalName: 'ООО «Сорвались»',
  inn: '0900000000',
  ogrn: '1000000000000',
  phoneDisplay: '+7 (900) 000-00-00',
  phoneTel: '+79000000000',
  whatsappUrl: 'https://wa.me/79000000000',
  telegramUrl: 'https://t.me/sorvalis',
  email: 'hello@sorvalis.ru',
  tagline: 'впечатления на всю жизнь',
  rating: 5.0,
  reviewsLabel: 'отзывы путешественников',
  socials: {
    vk: 'https://vk.com/sorvalis',
    telegram: 'https://t.me/sorvalis',
  },
} as const;

export const VALUE_PROPS = [
  {
    id: 'guides',
    title: 'Локальные гиды',
    text: 'Знают Кавказ изнутри',
    icon: 'guide' as const,
  },
  {
    id: 'price',
    title: 'Лучшие цены',
    text: 'Без посредников',
    icon: 'price' as const,
  },
  {
    id: 'support',
    title: 'Поддержка 24/7',
    text: 'Всегда на связи',
    icon: 'support' as const,
  },
  {
    id: 'comfort',
    title: 'Комфорт',
    text: 'Продуманные маршруты',
    icon: 'comfort' as const,
  },
] as const;

export const ABOUT_PROPS = [
  {
    id: 'routes',
    title: 'Уникальные маршруты',
    text: 'Составляем пути вне типовых шаблонов',
    icon: 'route' as const,
  },
  {
    id: 'places',
    title: 'Лучшие локации',
    text: 'Только проверенные точки Кавказа',
    icon: 'place' as const,
  },
  {
    id: 'pros',
    title: 'Профессиональные гиды',
    text: 'Местные эксперты на каждом маршруте',
    icon: 'guide' as const,
  },
  {
    id: 'quality',
    title: 'Гарантия качества',
    text: 'Сопровождение до возвращения домой',
    icon: 'shield' as const,
  },
] as const;

export const DEMO_REVIEWS = [
  {
    id: '1',
    name: 'Анна К.',
    route: 'Домбай · 3 дня',
    rating: 5,
    text: 'Маршрут собран идеально: без суеты, с сильными видами и локальной кухней. Уже планируем Эльбрус.',
    avatar: '/images/avatars/a.jpg',
  },
  {
    id: '2',
    name: 'Игорь М.',
    route: 'Бадукские озёра',
    rating: 5,
    text: 'Конструктор реально удобный — выбрали базу в Кисловодске и точки за вечер. Гиды на высоте.',
    avatar: '/images/avatars/b.jpg',
  },
  {
    id: '3',
    name: 'Мария С.',
    route: 'Архыз · семья',
    rating: 5,
    text: 'Ехали с детьми — темп комфортный, места красивые, поддержка отвечала даже ночью.',
    avatar: '/images/avatars/c.jpg',
  },
] as const;

export const CATEGORIES = [
  {
    name: 'Горы',
    slug: 'mountains',
    image: '/images/category-mountains.svg',
  },
  { name: 'Озёра', slug: 'lakes', image: '/images/category-lakes.svg' },
  { name: 'Каньоны', slug: 'canyons', image: '/images/category-canyons.svg' },
  {
    name: 'Водопады',
    slug: 'waterfalls',
    image: '/images/category-waterfalls.svg',
  },
  {
    name: 'Древности',
    slug: 'antiquities',
    image: '/images/category-antiquities.svg',
  },
  {
    name: 'Традиции',
    slug: 'traditions',
    image: '/images/category-traditions.svg',
  },
] as const;
