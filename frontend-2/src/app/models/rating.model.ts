export interface Rating {
  rating_id?: number;
  ride_id: number;
  given_by?: number;
  given_to?: number;
  score: number;
  comment?: string | null;
}
