import { request } from './client';
import type { ImageDto } from '@/types/image';

export const imagesApi = {
  upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    return request<ImageDto>('/images', {
      method: 'POST',
      body: form,
    });
  },
  remove(id: string) {
    return request<void>(`/images/${id}`, { method: 'DELETE' });
  },
};
