import mongoose from "mongoose";

const demoRequestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        age: {
            type: Number,
            required: true
        },
        dob: {
            type: Date,
            required: true
        },
        contactNumber: {
            type: String,
            required: true,
            match: [/^\d{1,10}$/, "Please fill a valid contact number (up to 10 digits)"]
        },
        state: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    { timestamps: true }
);

export default mongoose.model("DemoRequest", demoRequestSchema);
