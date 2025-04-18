import mongoose, { Schema } from "mongoose";

const FavoriteSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  courtId: {
    type: Schema.Types.ObjectId,
    ref: "Court",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure a user can only favorite a court once
FavoriteSchema.index({ userId: 1, courtId: 1 }, { unique: true });

// Check if model exists before creating it (prevents model overwrite error during hot reloading)
const Favorite =
  mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);

export default Favorite;
