import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: [true, "Full name is required"], trim: true },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  phone: { type: String, required: [true, "Phone number is required"], trim: true },
  message: { type: String, required: [true, "Message is required"], maxlength: 1000 },
  propertyInterested: { type: String, default: "General Enquiry", trim: true },
  status: { type: String, enum: ["New", "Contacted", "Closed"], default: "New" },
}, { timestamps: true });

export default mongoose.model("Enquiry", enquirySchema);
