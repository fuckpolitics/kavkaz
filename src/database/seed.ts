import 'dotenv/config';
import { createHash, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import dataSource from './data-source';
import { Booking } from './entities/booking.entity';
import { Destination } from './entities/destination.entity';
import { ExtraService } from './entities/extra-service.entity';
import { Image } from './entities/image.entity';
import { Location } from './entities/location.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { TourDayLocation } from './entities/tour-day-location.entity';
import { TourDay } from './entities/tour-day.entity';
import { TourExtraService } from './entities/tour-extra-service.entity';
import { Tour } from './entities/tour.entity';
import { TripDayLocation } from './entities/trip-day-location.entity';
import { TripDay } from './entities/trip-day.entity';
import { TripExtraService } from './entities/trip-extra-service.entity';
import { Trip } from './entities/trip.entity';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';

const PUBLIC_BASE_URL = (
  process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';
const SEED_ASSETS_DIR = process.env.SEED_ASSETS_DIR ?? './seed/assets';

type SeedLocation = {
  name: string;
  price: number | null;
  subs: string[];
  destinationSlug: string;
  lat: number;
  lng: number;
  imageQuery: string;
};

const DESTINATIONS = [
  {
    name: 'Карачаево-Черкесия',
    slug: 'karachay-cherkessia',
    description:
      'Домбай, Архыз, Бермамыт и горные озёра — сердце Западного Кавказа.',
    imageQuery: 'caucasus-mountains-dombay',
  },
  {
    name: 'Кабардино-Балкария',
    slug: 'kabardino-balkaria',
    description:
      'Эльбрус, Джилы-Су, Чегемские водопады и альпийские ущелья.',
    imageQuery: 'elbrus-mountain',
  },
  {
    name: 'Северная Осетия',
    slug: 'north-ossetia',
    description:
      'Куртатинское ущелье, Даргавс и Кармадон — древность и природа.',
    imageQuery: 'caucasus-valley',
  },
  {
    name: 'Ингушетия',
    slug: 'ingushetia',
    description: 'Джейрахские башни, Эгикал и храм Тхаба-Ерды.',
    imageQuery: 'ingushetia-towers',
  },
  {
    name: 'Чечня',
    slug: 'chechnya',
    description: 'Грозный, мечети и смотровые площадки столицы.',
    imageQuery: 'grozny-city',
  },
];

/** Spread sublocations on a local grid (~2–3 km) so route zoom can separate them. */
function subLatLng(lat: number, lng: number, index: number, total: number) {
  const cols = Math.max(2, Math.ceil(Math.sqrt(total)));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const spacing = 0.028;
  return {
    lat: lat + (row - (cols - 1) / 2) * spacing,
    lng: lng + (col - (cols - 1) / 2) * spacing * 1.15,
  };
}

const LOCATIONS: SeedLocation[] = [
  {
    name: 'Джилы Су + Бермамыт',
    price: 6000,
    destinationSlug: 'kabardino-balkaria',
    lat: 43.434,
    lng: 42.537,
    imageQuery: 'waterfall-mountains',
    subs: [
      'Плато Шаджатмаз',
      'Инстаграмная дорога',
      'Скалы Аватары',
      'Урочище Джилы-Су',
      'водопады Султан',
      'Кызыл Кол Су',
      'Кара Кая Су',
      'нарзанные источники',
      'Плато Бермамыт',
      'Скалы Монахи',
      'Амфитеатр',
      'смотровая на Эльбрус и Большой Кавказский хребет',
    ],
  },
  {
    name: 'Бермамыт',
    price: 3700,
    destinationSlug: 'karachay-cherkessia',
    lat: 43.706,
    lng: 42.441,
    imageQuery: 'mountain-plateau',
    subs: [
      'Плато Бермамыт',
      'Скалы Монахи',
      'Амфитеатр',
      'смотровая площадка на Эльбрус и Большой Кавказский хребет',
    ],
  },
  {
    name: 'Рассвет/Закат Бермамыт',
    price: 4200,
    destinationSlug: 'karachay-cherkessia',
    lat: 43.703,
    lng: 42.443,
    imageQuery: 'mountain-sunrise',
    subs: [
      'Плато Бермамыт',
      'Скалы Монахи',
      'Амфитеатр',
      'смотровая площадка на Эльбрус и Большой Кавказский хребет',
    ],
  },
  {
    name: 'Домбай',
    price: null,
    destinationSlug: 'karachay-cherkessia',
    lat: 43.29,
    lng: 41.602,
    imageQuery: 'dombay-ski',
    subs: [
      'Перевал Гумбаши',
      'Сырные пещеры',
      'Сынтинский храм X века',
      'озеро Каракель',
      'река Мурджуджу',
      'Домбай',
      'канатная дорога',
    ],
  },
  {
    name: 'Эльбрус',
    price: null,
    destinationSlug: 'kabardino-balkaria',
    lat: 43.355,
    lng: 42.439,
    imageQuery: 'elbrus-peak',
    subs: [
      'Озеро Гижгит (Былымское)',
      'река Адыр-Су',
      'Поляна Нарзанов',
      'Поляна Азау',
      'Эльбрус',
      'канатная дорога',
    ],
  },
  {
    name: 'Актопрак',
    price: 4200,
    destinationSlug: 'kabardino-balkaria',
    lat: 43.28,
    lng: 43.25,
    imageQuery: 'chegem-waterfall',
    subs: [
      'Озеро Гижгит (Былымское)',
      'перевал Актопрак',
      'Парадром',
      'Эльтюбё',
      'Старинный некрополь',
      'Чегемские водопады',
    ],
  },
  {
    name: 'Архыз',
    price: 4700,
    destinationSlug: 'karachay-cherkessia',
    lat: 43.565,
    lng: 41.279,
    imageQuery: 'arkhyz-mountains',
    subs: [
      'Перевал Гумбаши',
      'Сырные пещеры',
      'Шоанинский храм X века',
      'Лик Христа',
      'Аланское городище',
      'посёлок Романтик',
      'канатная дорога',
    ],
  },
  {
    name: 'Уллу-Тау',
    price: null,
    destinationSlug: 'kabardino-balkaria',
    lat: 43.24,
    lng: 42.68,
    imageQuery: 'alpine-camp',
    subs: ['Ущелье Адыр-Су', 'автомобильный подъёмник', 'альплагерь'],
  },
  {
    name: 'Верхняя Балкария',
    price: 5000,
    destinationSlug: 'kabardino-balkaria',
    lat: 43.12,
    lng: 43.45,
    imageQuery: 'blue-lakes',
    subs: [
      'Замок Шато Эркен',
      'Язык Тролля',
      'Голубые озёра',
      'Сторожевые башни',
      'термальные источники Аушигер',
    ],
  },
  {
    name: 'Северная Осетия',
    price: null,
    destinationSlug: 'north-ossetia',
    lat: 42.92,
    lng: 44.55,
    imageQuery: 'ossetia-canyon',
    subs: [
      'Куртатинское ущелье',
      'Аланский Свято-Успенский мужской монастырь',
      'Даргавс',
      'Кармадонское ущелье',
    ],
  },
  {
    name: 'Ингушетия',
    price: 5500,
    destinationSlug: 'ingushetia',
    lat: 42.96,
    lng: 44.9,
    imageQuery: 'ingush-towers',
    subs: [
      'Магас',
      'Башня Согласия',
      'Эгикал',
      'храм Тхаба-Ерды',
      'перевал Миатли',
      'Джейрахские башни',
    ],
  },
  {
    name: 'Грозный',
    price: 6000,
    destinationSlug: 'chechnya',
    lat: 43.318,
    lng: 45.698,
    imageQuery: 'grozny-mosque',
    subs: [
      'Мечеть «Гордость мусульман» (Шали)',
      'мечеть «Сердце матери» (Аргун)',
      'мечеть «Сердце Чечни» (Грозный)',
      'экскурсия по столице',
      'смотровая площадка',
      'лестница в небо',
    ],
  },
  {
    name: 'Озеро Хурла-Кёль',
    price: null,
    destinationSlug: 'karachay-cherkessia',
    lat: 43.52,
    lng: 41.85,
    imageQuery: 'mountain-lake',
    subs: [
      'Перевал Гумбаши',
      'Сырные пещеры',
      'слияние рек Кубань и Худес',
      'Царские Ворота',
      'озеро Хурла-Кёль',
    ],
  },
  {
    name: 'Махарское ущелье',
    price: 6000,
    destinationSlug: 'karachay-cherkessia',
    lat: 43.38,
    lng: 41.72,
    imageQuery: 'mountain-gorge',
    subs: [
      'Горные вершины',
      'озёра',
      'буреломы',
      'горная река',
      'нарзанные источники',
    ],
  },
  {
    name: 'Перевал Восьмёрка',
    price: 3500,
    destinationSlug: 'karachay-cherkessia',
    lat: 43.74,
    lng: 42.35,
    imageQuery: 'mountain-pass',
    subs: [
      'Обсерватория на плато Шаджатмаз',
      'Кичи-Балык',
      'перевал Восьмёрка',
      'Хасаут',
      'древний аул-призрак',
      'Долина Нарзанов',
    ],
  },
  {
    name: 'Медовые водопады',
    price: null,
    destinationSlug: 'karachay-cherkessia',
    lat: 43.885,
    lng: 42.587,
    imageQuery: 'honey-waterfalls',
    subs: [
      'Кольцо-гора',
      'Чайный домик',
      'зиплайн',
      'качели над пропастью',
      'комплекс «Медовые водопады»',
    ],
  },
  {
    name: 'Долина Нарзанов',
    price: 2000,
    destinationSlug: 'kabardino-balkaria',
    lat: 43.466,
    lng: 42.536,
    imageQuery: 'narzan-valley',
    subs: ['Долина Нарзанов'],
  },
  {
    name: 'Суворовские источники',
    price: 1300,
    destinationSlug: 'karachay-cherkessia',
    lat: 43.96,
    lng: 42.58,
    imageQuery: 'hot-springs',
    subs: ['Суворовские термальные источники'],
  },
  {
    name: 'Бадукские озёра',
    price: 5500,
    destinationSlug: 'karachay-cherkessia',
    lat: 43.42,
    lng: 41.72,
    imageQuery: 'baduk-lakes',
    subs: [
      'Теберда',
      'подвесной мост',
      'Национальный парк',
      'р. Хаджибей',
      'три Бадукских озера',
    ],
  },
];

/** locationName: null = global; otherwise parent or sublocation name from LOCATIONS. */
const EXTRA_SERVICES: {
  name: string;
  description: string;
  price: number;
  locationName: string | null;
}[] = [
  {
    name: 'Трансфер из Кисловодска',
    description: 'Комфортный трансфер туда-обратно от базы',
    price: 1500,
    locationName: null,
  },
  {
    name: 'Питание на маршруте',
    description: 'Обед и перекусы в течение дня',
    price: 1200,
    locationName: null,
  },
  {
    name: 'Личный координатор',
    description: 'Отдельный контакт на всём маршруте',
    price: 3500,
    locationName: null,
  },
  {
    name: 'Страховка путешественника',
    description: 'Расширенное покрытие на дни поездки',
    price: 900,
    locationName: null,
  },
  {
    name: 'Детское кресло в авто',
    description: 'Кресло/бустер под возраст ребёнка',
    price: 500,
    locationName: null,
  },
  {
    name: 'Фотограф на день',
    description: 'Профессиональная съёмка на ключевых точках',
    price: 5000,
    locationName: null,
  },
  {
    name: 'Канатная дорога Домбай',
    description: 'Билеты на подъёмники Домбая',
    price: 2800,
    locationName: 'Домбай',
  },
  {
    name: 'Рафтинг в Домбае',
    description: 'Сплав по Теберде с инструктором',
    price: 4200,
    locationName: 'Домбай',
  },
  {
    name: 'Конная прогулка Архыз',
    description: '1,5 часа по живописным тропам',
    price: 3200,
    locationName: 'Архыз',
  },
  {
    name: 'Обсерватория Архыз',
    description: 'Экскурсия в Специальную астрофизическую обсерваторию',
    price: 1800,
    locationName: 'Архыз',
  },
  {
    name: 'Канатка Эльбрус',
    description: 'Подъём на станции канатной дороги',
    price: 3500,
    locationName: 'Эльбрус',
  },
  {
    name: 'Снегоходы Эльбрус',
    description: 'Катание на снегоходах (сезонно)',
    price: 5500,
    locationName: 'Эльбрус',
  },
  {
    name: 'Термы Джилы-Су',
    description: 'Купание в источниках и время на отдых',
    price: 1500,
    locationName: 'Джилы Су + Бермамыт',
  },
  {
    name: 'Рассвет на Бермамыте',
    description: 'Ранний выезд и сопровождение на смотровой',
    price: 2500,
    locationName: 'Бермамыт',
  },
  {
    name: 'Квадроциклы Бадук',
    description: 'Аренда квадроцикла рядом с озёрами',
    price: 4500,
    locationName: 'Бадукские озёра',
  },
  {
    name: 'Баня после маршрута',
    description: 'Посещение бани вечером после активного дня',
    price: 2500,
    locationName: 'Бадукские озёра',
  },
  {
    name: 'Городская экскурсия Грозный',
    description: 'Обзорная программа по городу с гидом',
    price: 2200,
    locationName: 'Грозный',
  },
  {
    name: 'Башни Ингушетии',
    description: 'Расширенная программа по башенным комплексам',
    price: 2000,
    locationName: 'Ингушетия',
  },
];

/** Stable Unsplash photo IDs for Caucasus / mountains (downloaded locally). */
const IMAGE_URLS: Record<string, string> = {
  'caucasus-mountains-dombay':
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
  'elbrus-mountain':
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1600&q=80',
  'caucasus-valley':
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
  'ingushetia-towers':
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1600&q=80',
  'grozny-city':
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1600&q=80',
  'waterfall-mountains':
    'https://images.unsplash.com/photo-1432405972618-c60b0225d3e0?w=1600&q=80',
  'mountain-plateau':
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&q=80',
  'mountain-sunrise':
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80',
  'dombay-ski':
    'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1600&q=80',
  'elbrus-peak':
    'https://images.unsplash.com/photo-1483728642387-6c3b20cc607f?w=1600&q=80',
  'chegem-waterfall':
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80',
  'arkhyz-mountains':
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80',
  'alpine-camp':
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1600&q=80',
  'blue-lakes':
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1600&q=80',
  'ossetia-canyon':
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80',
  'ingush-towers':
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80',
  'grozny-mosque':
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=80',
  'mountain-lake':
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=80',
  'mountain-gorge':
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80',
  'mountain-pass':
    'https://images.unsplash.com/photo-1483728642387-6c3b20cc607f?w=1400&q=80',
  'honey-waterfalls':
    'https://images.unsplash.com/photo-1432405972618-c60b0225d3e0?w=1400&q=80',
  'narzan-valley':
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80',
  'hot-springs':
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&q=80',
  'baduk-lakes':
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1400&q=80',
  hero: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2000&q=85',
};

async function resolveSeedImage(
  key: string,
  url: string,
): Promise<{ filename: string; size: number; mimeType: string }> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${createHash('md5').update(key).digest('hex')}.jpg`;
  const filepath = join(UPLOAD_DIR, filename);
  const bundled = join(SEED_ASSETS_DIR, `${key}.jpg`);

  try {
    const bundledStat = await fs.stat(bundled);
    if (bundledStat.size > 1000) {
      await fs.copyFile(bundled, filepath);
      return { filename, size: bundledStat.size, mimeType: 'image/jpeg' };
    }
  } catch {
    // fall through to cache / download
  }

  try {
    await fs.access(filepath);
    const stat = await fs.stat(filepath);
    if (stat.size > 1000) {
      return { filename, size: stat.size, mimeType: 'image/jpeg' };
    }
  } catch {
    // download
  }

  const res = await fetch(url, {
    headers: { 'User-Agent': 'sorvalis-seed/1.0' },
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${key}: ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(filepath, buf);
  return { filename, size: buf.length, mimeType: 'image/jpeg' };
}

async function saveImageEntity(
  key: string,
  url: string,
): Promise<Image> {
  const repo = dataSource.getRepository(Image);
  const file = await resolveSeedImage(key, url);
  const image = repo.create({
    id: randomUUID(),
    filename: file.filename,
    originalName: `${key}.jpg`,
    mimeType: file.mimeType,
    size: file.size,
    width: null,
    height: null,
    url: `${PUBLIC_BASE_URL}/uploads/${file.filename}`,
  });
  return repo.save(image);
}

async function clearDatabase() {
  await dataSource.query(`
    TRUNCATE TABLE
      booking_extra_services,
      booking_day_locations,
      booking_days,
      bookings,
      trip_extra_services,
      trip_day_locations,
      trip_days,
      trips,
      tour_extra_services,
      tour_day_locations,
      tour_days,
      tours,
      refresh_tokens,
      location_images,
      locations,
      destinations,
      extra_services,
      users,
      images
    RESTART IDENTITY CASCADE
  `);
}

async function seed() {
  console.log('Connecting...');
  await dataSource.initialize();
  console.log('Clearing database...');
  await clearDatabase();

  console.log('Loading images from seed/assets (or download fallback)...');
  const imageMap = new Map<string, Image>();
  for (const [key, url] of Object.entries(IMAGE_URLS)) {
    process.stdout.write(`  ${key}... `);
    try {
      const img = await saveImageEntity(key, url);
      imageMap.set(key, img);
      console.log('ok');
    } catch (e) {
      console.log('fail', e instanceof Error ? e.message : e);
    }
  }

  // also copy hero to frontend public
  const hero = imageMap.get('hero');
  if (hero) {
    const src = join(UPLOAD_DIR, hero.filename);
    const destDir = join(process.cwd(), 'frontend/public/images');
    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(src, join(destDir, 'hero.jpg')).catch(() => undefined);
  }

  console.log('Creating destinations...');
  const destRepo = dataSource.getRepository(Destination);
  const destMap = new Map<string, Destination>();
  for (const d of DESTINATIONS) {
    const cover = imageMap.get(d.imageQuery) ?? null;
    const dest = await destRepo.save(
      destRepo.create({
        name: d.name,
        slug: d.slug,
        description: d.description,
        coverImageId: cover?.id ?? null,
      }),
    );
    destMap.set(d.slug, dest);
  }

  console.log('Creating locations...');
  const locRepo = dataSource.getRepository(Location);
  const locMap = new Map<string, Location>();
  for (const loc of LOCATIONS) {
    const dest = destMap.get(loc.destinationSlug)!;
    const cover = imageMap.get(loc.imageQuery);
    const parent = await locRepo.save(
      locRepo.create({
        destinationId: dest.id,
        parentId: null,
        name: loc.name,
        description: [
          `Выезд из Кисловодска. Группа до 8 человек.`,
          loc.price != null
            ? `Цена за место в группе: ${loc.price} ₽.`
            : `Цена по запросу.`,
          `Подлокации: ${loc.subs.join(', ')}.`,
          `Входные билеты, канатные дороги и эко-сбор оплачиваются отдельно.`,
        ].join(' '),
        latitude: loc.lat,
        longitude: loc.lng,
        address: loc.name,
        visitDurationMinutes: 120,
        travelFromBaseMinutes:
          loc.name.includes('Домбай') || loc.name.includes('Архыз')
            ? 180
            : loc.name.includes('Эльбрус') || loc.name.includes('Бермамыт')
              ? 150
              : loc.name.includes('Грозный') || loc.name.includes('Ингушетия')
                ? 210
                : 120,
      }),
    );
    if (cover) {
      await dataSource
        .createQueryBuilder()
        .relation(Location, 'images')
        .of(parent)
        .add(cover);
    }
    locMap.set(loc.name, parent);

    for (const [i, sub] of loc.subs.entries()) {
      const coords = subLatLng(loc.lat, loc.lng, i, loc.subs.length);
      await locRepo.save(
        locRepo.create({
          destinationId: dest.id,
          parentId: parent.id,
          name: sub,
          description: `Точка маршрута «${loc.name}»`,
          latitude: coords.lat,
          longitude: coords.lng,
          address: sub,
          visitDurationMinutes: 45 + (i % 3) * 15,
          travelFromBaseMinutes: null,
        }),
      );
    }
  }

  console.log('Creating extra services...');
  const esRepo = dataSource.getRepository(ExtraService);
  const allLocations = await locRepo.find();
  const locationByName = new Map(allLocations.map((l) => [l.name, l]));
  const extras: ExtraService[] = [];
  for (const es of EXTRA_SERVICES) {
    const linked = es.locationName
      ? locationByName.get(es.locationName)
      : null;
    extras.push(
      await esRepo.save(
        esRepo.create({
          name: es.name,
          description: es.description,
          price: es.price.toFixed(2),
          locationId: linked?.id ?? null,
        }),
      ),
    );
  }

  console.log('Creating tours...');
  const tourRepo = dataSource.getRepository(Tour);
  const dayRepo = dataSource.getRepository(TourDay);
  const dayLocRepo = dataSource.getRepository(TourDayLocation);
  const tourEsRepo = dataSource.getRepository(TourExtraService);

  const priced = LOCATIONS.filter((l) => l.price !== null);
  for (const loc of priced) {
    const dest = destMap.get(loc.destinationSlug)!;
    const location = locMap.get(loc.name)!;
    const cover = imageMap.get(loc.imageQuery);
    // Day trip from Kislovodsk: price = seat in group (up to 8), from locations_prices.md
    const durationDays = 1;
    const tourPrice = loc.price!;

    const tour = await tourRepo.save(
      tourRepo.create({
        destinationId: dest.id,
        title: `${loc.name} — день`,
        description: `Авторский маршрут: ${loc.name}. Включает: ${loc.subs.slice(0, 5).join(', ')}. Выезд из Кисловодска, группа до 8 человек. Цена за место: ${tourPrice} ₽.`,
        price: tourPrice.toFixed(2),
        durationDays,
        coverImageId: cover?.id ?? null,
        isActive: true,
      }),
    );

    for (let day = 1; day <= durationDays; day++) {
      const chunk = loc.subs;
      const tourDay = await dayRepo.save(
        dayRepo.create({
          tourId: tour.id,
          dayNumber: day,
          title: `Знакомство с ${loc.name}`,
          description:
            chunk.length > 0
              ? `Программа дня: ${chunk.join(', ')}.`
              : `Свободное время и ключевые точки ${loc.name}.`,
        }),
      );
      await dayLocRepo.save(
        dayLocRepo.create({
          tourDayId: tourDay.id,
          locationId: location.id,
          order: 0,
          isRequired: true,
        }),
      );
    }

    // attach first two extras
    for (const es of extras.slice(0, 2)) {
      await tourEsRepo.save(
        tourEsRepo.create({
          tourId: tour.id,
          extraServiceId: es.id,
          dayNumber: null,
          price: es.price,
        }),
      );
    }
  }

  console.log('Creating users...');
  const userRepo = dataSource.getRepository(User);

  await userRepo.save(
    userRepo.create({
      email: 'admin@sorvalis.ru',
      passwordHash: null,
      firstName: 'Админ',
      lastName: 'Сорвались',
      phone: '+79001112233',
      role: UserRole.ADMIN,
      isActive: true,
    }),
  );
  await userRepo.save(
    userRepo.create({
      email: 'user@sorvalis.ru',
      passwordHash: null,
      firstName: 'Иван',
      lastName: 'Путешественник',
      phone: '+79005556677',
      role: UserRole.USER,
      isActive: true,
    }),
  );

  console.log('\nSeed complete!');
  console.log('OTP test code: 0000');
  console.log('Admin: admin@sorvalis.ru or +79001112233');
  console.log('User:  user@sorvalis.ru or +79005556677');
  await dataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
