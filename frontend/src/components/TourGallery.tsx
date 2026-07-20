import type { ImageDto } from '@/types/image';
import { resolveImageUrl } from '@/lib/format';

export function TourGallery({
  coverImage,
  title,
  images = [],
}: {
  coverImage: ImageDto | null;
  title: string;
  images?: ImageDto[];
}) {
  const main = resolveImageUrl(coverImage?.url, '/images/placeholder-tour.svg');
  const extras = images
    .filter((img) => img.id !== coverImage?.id)
    .slice(0, 3)
    .map((img) => resolveImageUrl(img.url));

  while (extras.length < 2) {
    extras.push(
      extras[0] ??
        '/images/categories/mountains.jpg',
    );
  }

  return (
    <div className="grid gap-2 tablet:grid-cols-3 tablet:grid-rows-2">
      <div className="overflow-hidden rounded-[24px] tablet:col-span-2 tablet:row-span-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main}
          alt={title}
          className="aspect-[16/10] h-full w-full object-cover tablet:aspect-auto tablet:min-h-[360px]"
        />
      </div>
      {extras.slice(0, 2).map((src, i) => (
        <div key={`${src}-${i}`} className="hidden overflow-hidden rounded-[24px] tablet:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="h-full min-h-[170px] w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
