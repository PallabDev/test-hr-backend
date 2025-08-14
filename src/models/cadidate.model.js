import mongoose, { Schema } from "mongoose";

const candidateSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    dob: { type: Date, required: true },

    education: {
        institute: { type: String, required: true },
        specialization: { type: String, required: true },
    },

    achievements: { type: String },

    bankDetails: {
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountHolderName: { type: String, required: true },
        ifscCode: { type: String, required: true }
    },

    documentNumbers: {
        panCardNumber: { type: String, required: true, unique: true },
        aadhaarCardNumber: { type: String, required: true, unique: true }
    },

    photoUrl: { type: String, required: true },

    documents: {
        resumeUrl: { type: String, required: true },
        idProofUrl: { type: String, required: true },
    },

    galleryImages: { type: [String] },

    applicationStatus: { type: String, default: "pending" },
    applyFor: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }

}, { timestamps: true });

export const Candidate = mongoose.model("Candidate", candidateSchema);
