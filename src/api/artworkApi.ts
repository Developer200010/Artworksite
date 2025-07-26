import type { Artwork } from '../types/artwork';

interface ApiPagination {
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
  current_page: number;
}

export interface ArtworkApiResponse {
  data: Artwork[];
  pagination: ApiPagination;
}

export async function fetchArtworks(page = 1, limit = 10): Promise<ArtworkApiResponse> {
  const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch artworks');
  return res.json();
}
