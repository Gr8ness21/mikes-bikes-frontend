import nimbus from './assets/video/Nimbus.MOV';
import type { GalleryItem } from './types';

export const leadReel: GalleryItem = {
  _id: 'nimbus-lead',
  url: nimbus,
  originalName: 'Nimbus.MOV',
  kind: 'video',
  alt: "We'll Come Get You!",
  showOnHome: true,
  showOnAbout: true,
  order: -1,
};

export function withLeadReel(items: GalleryItem[]) {
  return [leadReel, ...items.filter((item) => item._id !== leadReel._id)];
}
