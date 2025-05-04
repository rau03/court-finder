export interface Court {
  _id: string;
  placeId: string;
  name: string;
  address: string;
  state: string;
  zipCode: string;
  indoor: boolean;
  numberOfCourts: number;
  location: {
    type: string;
    coordinates: number[];
  };
  isVerified: boolean;
  addedByUser: boolean;
  source: string;
  lastVerified: Date;
}

export interface CourtInput
  extends Omit<Court, "_id" | "placeId" | "lastVerified"> {
  city?: string;
  amenities?: Record<string, unknown>;
  contact?: Record<string, unknown>;
}
