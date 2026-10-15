import { useEffect, useState } from 'react';
import { api } from '../api';
import type { GalleryItem } from '../types';

export function useGallery(slot?: 'home' | 'about') {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const path = slot ? `/api/gallery?slot=${slot}` : '/api/gallery';
    api<{ items: GalleryItem[] }>(path)
      .then((data) => setItems(data.items))
      .catch(() => setItems([]));
  }, [slot]);

  return items;
}
