import { Schema, models, model } from "mongoose";


// Define the Court interface
interface Court {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  location: {
    type: string;
    coordinates: number[];
  };
  amenities: {
    indoorCourts: boolean;
    outdoorCourts: boolean;
    lightsAvailable: boolean;
    restroomsAvailable: boolean;
    waterFountain: boolean;
  };
  numberOfCourts: number;
  surfaceType: string;
  cost: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  isVerified: boolean;
  addedByUser: boolean;
  lastVerified: Date;
  rating: number;
  reviews: {
    userId: string;
    text: string;
    rating: number;
    createdAt: Date;
  }[];
  contact: {
    website: string;
    phone: string;
    email: string;
  };
  indoor: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const CourtSchema = new Schema<Court>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, default: "" },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  amenities: {
    indoorCourts: { type: Boolean, default: false },
    outdoorCourts: { type: Boolean, default: true },
    lightsAvailable: { type: Boolean, default: false },
    restroomsAvailable: { type: Boolean, default: false },
    waterFountain: { type: Boolean, default: false },
  },
  numberOfCourts: { type: Number, default: 1 },
  surfaceType: { type: String, default: "Unknown" },
  cost: { type: String, default: "Unknown" },
  hours: {
    monday: { type: String, default: "" },
    tuesday: { type: String, default: "" },
    wednesday: { type: String, default: "" },
    thursday: { type: String, default: "" },
    friday: { type: String, default: "" },
    saturday: { type: String, default: "" },
    sunday: { type: String, default: "" },
  },
  isVerified: { type: Boolean, default: false },
  addedByUser: { type: Boolean, default: true },
  lastVerified: { type: Date, default: Date.now },
  rating: { type: Number, default: 0 },
  reviews: [
    {
      userId: String,
      text: String,
      rating: Number,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  contact: {
    website: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  indoor: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create a geospatial index for location-based queries
CourtSchema.index({ location: "2dsphere" });

// Export the model
const Court = models.Court || model<Court>("Court", CourtSchema);

export default Court;
