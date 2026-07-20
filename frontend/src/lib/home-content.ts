/** Homepage marketing copy & structured content. Update numbers only when confirmed. */

export const FORM_MICROCOPY =
  'Расчёт бесплатный. Не передаём контакты третьим лицам и не будем навязывать тур.';

export const CTA_PHRASES = [
  'Рассчитать полную стоимость',
  'Подобрать три маршрута',
  'Выбрать готовый тур',
  'Собрать индивидуальную поездку',
  'Получить программу',
  'Задать вопрос координатору',
  'Получить гид',
] as const;

export const TRUST_STRIP = {
  headline:
    'Вы отдыхаете — мы соединяем весь Кавказ в одно организованное путешествие',
  points: [
    'Домбай, Архыз, Эльбрус и КМВ в одной продуктовой линейке',
    'Групповые и индивидуальные маршруты',
    'Группы от 6 до 12 человек',
    'Организация поездок для компаний до 50 человек',
    'Местные гиды, водители и партнёры',
    'Поддержка до, во время и после путешествия',
  ],
} as const;

/**
 * Confirmed business figures only — replace before launch if outdated.
 * `routes` on the page is taken from the live tours API count.
 */
export const TRUST_STATS = {
  travelers: 2400,
  years: 7,
  rating: 4.9,
} as const;

export const BENEFITS = [
  {
    id: 'price',
    title: 'Прозрачная цена',
    text: 'Видите полную смету до оплаты: трансфер, проживание, гид, канатки и доплаты.',
    proof: {
      label: 'Пример сметы на 2 взрослых · 4 дня',
      lines: [
        { name: 'Трансфер и логистика', value: '18 400 ₽' },
        { name: 'Проживание с завтраками', value: '24 000 ₽' },
        { name: 'Гид и программа', value: '16 800 ₽' },
        { name: 'Итого на двоих', value: '59 200 ₽', bold: true },
      ],
    },
  },
  {
    id: 'flex',
    title: 'Гибкость под состав',
    text: 'Темп, ночёвки и точки подбираем под семью, компанию или индивидуальный формат.',
    proof: {
      label: 'Сценарий сопровождения',
      lines: [
        { name: 'До поездки', value: 'координатор и план дня' },
        { name: 'В дороге', value: 'один ответственный на связи' },
        { name: 'После', value: 'отчёт и помощь с возвратом' },
      ],
    },
  },
  {
    id: 'local',
    title: 'Местная команда',
    text: 'Гиды, водители и партнёры в регионе — без цепочки посредников.',
    proof: {
      label: 'Кто отвечает',
      lines: [
        { name: 'Координатор', value: 'один контакт' },
        { name: 'Водитель', value: 'знакомый маршрут' },
        { name: 'Гид', value: 'локальный эксперт' },
      ],
    },
  },
] as const;

export const SAFETY = {
  title: 'Безопасность и план Б',
  lead: 'Если плохая погода — сориентируемся и подберём другие впечатления. До поездки вы будете знать не только название гостиницы, но и кто, на чём и по какому маршруту вас повезёт.',
  evidence:
    'Безопасность — это не обещание в одном буллете, а конкретные люди, автомобили и регламенты.',
  planB: {
    title: 'Погодный кейс',
    text: 'Туман на Эльбрусе → перенос канатки на следующий слот, вместо этого — минеральные источники и обзорная точка с безопасным доступом. День не «сгорает».',
  },
  items: [
    { id: 'transport', title: 'Транспорт', text: 'Фото автомобилей и число пассажирских мест до бронирования.' },
    { id: 'drivers', title: 'Водители', text: 'Опыт горных маршрутов и закреплённый водитель на группу.' },
    { id: 'guides', title: 'Гиды', text: 'Локальный опыт, знакомство с высотными участками и запасными тропами.' },
    { id: 'docs', title: 'Документы', text: 'Разрешения, страховка и правила поездок с детьми — в одном пакете.' },
    { id: 'kids', title: 'С детьми', text: 'Детские кресла по запросу, темп и остановки под семью.' },
    { id: 'coord', title: 'Координатор', text: 'Контакты ответственного до выезда и на всём маршруте.' },
  ],
  cta: 'Получить информацию о безопасности',
} as const;

export const GALLERY_MOMENTS = [
  { id: 'meet', label: 'Встреча', image: '/images/placeholder-mountains.svg' },
  { id: 'car', label: 'Автомобиль', image: '/images/category-mountains.svg' },
  { id: 'road', label: 'Дорога', image: '/images/category-canyons.svg' },
  { id: 'stop', label: 'Остановки', image: '/images/category-lakes.svg' },
  { id: 'hotel', label: 'Гостиница', image: '/images/category-traditions.svg' },
  { id: 'breakfast', label: 'Завтраки', image: '/images/category-antiquities.svg' },
  { id: 'group', label: 'Группа', image: '/images/placeholder-destination.svg' },
  { id: 'guide', label: 'Гид', image: '/images/placeholder-tour.svg' },
  { id: 'cable', label: 'Канатные дороги', image: '/images/category-waterfalls.svg' },
  { id: 'free', label: 'Свободное время', image: '/images/category-mountains.svg' },
  { id: 'evening', label: 'Вечер', image: '/images/placeholder-mountains.svg' },
  { id: 'alt', label: 'Альтернатива', image: '/images/category-lakes.svg' },
] as const;

export const COMPARISON = {
  title: 'Самостоятельно, с агрегатором или с местным организатором',
  subtitle: 'Выберите не только по цене',
  footer:
    'Сохраняете свободу самостоятельной поездки, но передаёте организационную нагрузку местной команде',
  cta: 'Получить расчёт и сравнить',
  columns: ['Критерий', 'Самостоятельно', 'Через агрегатор', 'С нами'] as const,
  rows: [
    ['Составление маршрута', 'Самостоятельно', 'Готовая программа', 'Готовая или персональная'],
    ['Один ответственный', 'Нет', 'Не всегда', 'Да'],
    ['Полный обязательный бюджет', 'Нужно считать', 'Зависит от тура', 'Показываем заранее'],
    ['Изменение программы по погоде', 'Самостоятельно', 'По правилам организатора', 'Перестраиваем локально'],
    ['Выбор гостиницы и темпа', 'Полный, но всё организуете сами', 'Обычно ограничен', 'Настраивается'],
    ['Поддержка на маршруте', 'Нет', 'Зависит от продукта', 'Один координатор'],
    ['Экономия времени', 'Минимальная', 'Средняя', 'Максимальная'],
  ] as const,
};

export type QuizAnswer = string | string[];

export interface QuizQuestion {
  id: string;
  title: string;
  /** Allow selecting several options before continuing */
  multi?: boolean;
  options: { id: string; label: string }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'when',
    title: 'Когда планируете поездку?',
    options: [
      { id: 'soon', label: 'В ближайший месяц' },
      { id: 'season', label: 'В этом сезоне' },
      { id: 'later', label: 'Через 2–3 месяца' },
      { id: 'flex', label: 'Даты гибкие' },
    ],
  },
  {
    id: 'people',
    title: 'Сколько человек едет?',
    options: [
      { id: '1-2', label: '1–2' },
      { id: '3-5', label: '3–5' },
      { id: '6-12', label: '6–12' },
      { id: '13+', label: 'Больше 12' },
    ],
  },
  {
    id: 'who',
    title: 'Кто будет путешествовать?',
    options: [
      { id: 'couple', label: 'Пара' },
      { id: 'friends', label: 'Друзья' },
      { id: 'family', label: 'Семья с детьми' },
      { id: 'corp', label: 'Компания / команда' },
    ],
  },
  {
    id: 'days',
    title: 'Сколько дней есть на отдых?',
    options: [
      { id: '2-3', label: '2–3 дня' },
      { id: '4-5', label: '4–5 дней' },
      { id: '6-8', label: '6–8 дней' },
      { id: '9+', label: 'Больше недели' },
    ],
  },
  {
    id: 'must',
    title: 'Какие места хотите увидеть обязательно?',
    multi: true,
    options: [
      { id: 'dombay', label: 'Домбай' },
      { id: 'arkhyz', label: 'Архыз' },
      { id: 'elbrus', label: 'Эльбрус' },
      { id: 'kmv', label: 'КМВ' },
    ],
  },
  {
    id: 'activity',
    title: 'Какой уровень активности вам комфортен?',
    options: [
      { id: 'easy', label: 'Спокойный, без нагрузки' },
      { id: 'medium', label: 'Средний: прогулки и смотровые' },
      { id: 'active', label: 'Активный: треккинг и высота' },
    ],
  },
  {
    id: 'budget',
    title: 'Какой бюджет планируете?',
    options: [
      { id: 'eco', label: 'До 40 000 ₽ с человека' },
      { id: 'mid', label: '40–80 000 ₽' },
      { id: 'comfort', label: 'От 80 000 ₽' },
      { id: 'open', label: 'Пока считаем варианты' },
    ],
  },
  {
    id: 'worry',
    title: 'Что больше всего беспокоит перед поездкой?',
    options: [
      { id: 'price', label: 'Скрытые доплаты' },
      { id: 'weather', label: 'Погода и срыв программы' },
      { id: 'org', label: 'Организация и логистика' },
      { id: 'safety', label: 'Безопасность и транспорт' },
    ],
  },
];

export interface QuizVariant {
  id: string;
  title: string;
  kind: string;
  region: string;
  budget: string;
  diff: string;
}

export function buildQuizResults(answers: Record<string, QuizAnswer>): QuizVariant[] {
  const mustRaw = answers.must ?? [];
  const mustList = Array.isArray(mustRaw) ? mustRaw : [mustRaw];
  const budget = typeof answers.budget === 'string' ? answers.budget : 'mid';
  const activity =
    typeof answers.activity === 'string' ? answers.activity : 'medium';
  const who = typeof answers.who === 'string' ? answers.who : 'couple';

  const regionMap: Record<string, string> = {
    dombay: 'Домбай',
    arkhyz: 'Архыз',
    elbrus: 'Эльбрус',
    kmv: 'Кавминводы',
  };
  const region =
    mustList.length === 0
      ? 'Кавказ'
      : mustList.length === 1
        ? (regionMap[mustList[0]] ?? 'Кавказ')
        : mustList.map((id) => regionMap[id] ?? id).join(' + ');

  const budgetLabel =
    budget === 'eco'
      ? 'от 32 000 ₽ / чел.'
      : budget === 'comfort'
        ? 'от 78 000 ₽ / чел.'
        : 'от 48 000 ₽ / чел.';

  const pace =
    activity === 'easy'
      ? 'спокойный темп'
      : activity === 'active'
        ? 'активный темп'
        : 'сбалансированный темп';

  const format =
    who === 'family'
      ? 'с детьми'
      : who === 'corp'
        ? 'для компании'
        : 'для вашей группы';

  return [
    {
      id: 'optimal',
      title: `Оптимальный маршрут · ${region}`,
      kind: 'оптимальный маршрут',
      region,
      budget: budgetLabel,
      diff: `Собран под ${pace} и формат ${format}. Баланс знаковых точек и комфорта без лишней гонки.`,
    },
    {
      id: 'value',
      title: `Более доступный · ${region}`,
      kind: 'более доступный вариант',
      region,
      budget:
        budget === 'comfort' ? 'от 52 000 ₽ / чел.' : 'от 28 000 ₽ / чел.',
      diff: 'Те же ключевые впечатления, проще размещение и плотнее логистика — без потери смысла поездки.',
    },
    {
      id: 'comfort',
      title: `Комфорт / индивидуальный · ${region}`,
      kind: 'более комфортный или индивидуальный',
      region,
      budget:
        budget === 'eco' ? 'от 58 000 ₽ / чел.' : 'от 86 000 ₽ / чел.',
      diff: 'Меньше людей в группе или личный формат, гибкие окна и усиленный сервис сопровождения.',
    },
  ];
}
