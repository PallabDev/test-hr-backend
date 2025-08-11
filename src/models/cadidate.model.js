import mongoose, { Schema } from "mongoose";

const candidateSchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    phone: {
        type: String, // Phone as string for flexibility
        required: true,
    },

    address: {
        type: String,
        required: true,
    },

    dob: {
        type: Date,
        required: true,
    },

    education: {
        institute: {
            type: String,
            required: true,
        },
        specialization: {
            type: String,
            required: true,
        },
    },

    achievements: {
        type: String, // HTML string from TinyMCE editor
        required: false,
    },

    photoUrl: {
        type: String,
        required: true,
    },

    documents: {
        resumeUrl: {
            type: String,
            required: true,
        },
        idProofUrl: {
            type: String,
            required: true,
        },
    },

    galleryImages: {
        type: [String], // Array of image URLs
        required: false,
    },

    applicationStatus: {
        type: String,
        default: "pending",
    },

}, { timestamps: true });

export const Candidate = mongoose.model("Candidate", candidateSchema);
