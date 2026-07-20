'use client';

import { useRef, useState } from 'react';
import { imagesApi } from '@/api/images.api';
import { ApiError } from '@/api/client';
import { resolveImageUrl } from '@/lib/format';
import type { ImageDto } from '@/types/image';

export function ImageIdsPicker({
  images,
  onChange,
  disabled = false,
}: {
  images: ImageDto[];
  onChange: (images: ImageDto[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: ImageDto[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await imagesApi.upload(file));
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-text-primary">Фотографии</span>
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-btn border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface disabled:opacity-50"
        >
          {uploading ? 'Загрузка…' : 'Добавить фото'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void onPick(e.target.files)}
        />
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {images.length === 0 ? (
        <p className="text-sm text-text-secondary">Пока без фото</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative h-20 w-28 overflow-hidden rounded-xl border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(image.url)}
                alt={image.originalName}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange(images.filter((item) => item.id !== image.id))
                }
                className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
                title="Убрать"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
