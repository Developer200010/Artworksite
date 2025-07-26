import { useState } from 'react';
import type { MinimalArtworkInfo } from '../types/artwork';

export function useRowSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectionInfo, setSelectionInfo] = useState<Map<number, MinimalArtworkInfo>>(new Map());

  const selectRows = (artworks: MinimalArtworkInfo[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      artworks.forEach(a => next.add(a.id));
      return next;
    });

    setSelectionInfo(prev => {
      const next = new Map(prev);
      artworks.forEach(a => next.set(a.id, a));
      return next;
    });
  };

  const deselectRows = (ids: number[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });

    setSelectionInfo(prev => {
      const next = new Map(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  };

  return { selectedIds, selectionInfo, selectRows, deselectRows };
}
