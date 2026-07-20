/** Base overnight cities — day trips radiate from here. */
export const BASE_CITIES = [
  {
    id: 'kislovodsk',
    name: 'Кисловодск',
    lat: 43.9056,
    lng: 42.7168,
    description: 'Главная база туров: выезды в горы, отели и парк.',
  },
  {
    id: 'essentuki',
    name: 'Ессентуки',
    lat: 44.0444,
    lng: 42.8589,
    description: 'Курортный город Кавминвод, удобная база для экскурсий.',
  },
  {
    id: 'zheleznovodsk',
    name: 'Железноводск',
    lat: 44.1394,
    lng: 43.0197,
    description: 'Тихий курорт у Бештау, отсюда тоже удобно ездить в горы.',
  },
] as const;

export type BaseCityId = (typeof BASE_CITIES)[number]['id'];

export function getBaseCity(id: BaseCityId | string | null | undefined) {
  return BASE_CITIES.find((c) => c.id === id) ?? null;
}
