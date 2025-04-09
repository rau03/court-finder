import mongoose, { Schema, models, model } from "mongoose";

// Define the Court interface
interface ICourt {
  name: string;
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  state: string;
  zipCode: string;
  indoor: boolean;
  numberOfCourts: number;
}

// Define the schema
const CourtSchema = new Schema<ICourt>({
  name: { type: String, required: true },
  address: { type: String, required: true },
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
  state: { type: String, default: "" },
  zipCode: { type: String, default: "" },
  indoor: { type: Boolean, default: false },
  numberOfCourts: { type: Number, default: 1 },
});

// Create a geospatial index for location-based queries
CourtSchema.index({ location: "2dsphere" });

// Export the model
const Court = models.Court || model<ICourt>("Court", CourtSchema);

export default Court;
