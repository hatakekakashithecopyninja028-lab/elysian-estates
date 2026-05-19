import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: { type: String, required: [true, "Title is required"], trim: true },
  description: { type: String, required: [true, "Description is required"] },
  price: { type: Number, required: [true, "Price is required"], min: 0 },
  priceFormatted: { type: String },
  type: {
    type: String,
    required: true,
    enum: ["Villa", "Penthouse", "Estate", "Mansion", "Apartment", "Townhouse", "Other"],
    default: "Villa",
  },
  location: { type: String, required: [true, "Location is required"], trim: true },
  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  area: { type: Number, required: true, min: 0 },
  thumbnail: { type: String, default: "" },
  images: [{ type: String }],
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ["Available", "Sold", "Under Offer"], default: "Available" },
}, { timestamps: true });

propertySchema.pre("save", function (next) {
  if (this.isModified("price")) {
    this.priceFormatted = "₹" + this.price.toLocaleString("en-IN");
  }
  next();
});

propertySchema.index({ location: "text", title: "text" });

export default mongoose.model("Property", propertySchema);
