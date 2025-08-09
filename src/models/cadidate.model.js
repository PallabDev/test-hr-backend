import mongoose, { Schema } from "mongoose";


const candidateSchema = new Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
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
        type: Number,
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
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
    },

    // Qualification details
    qualification: {
        highestQualification: {
            type: String,
            required: true,
        },
        instituteName: {
            type: String,
            required: true,
        },
        yearOfCompletion: {
            type: Number,
            required: true,
        },
        fieldOfStudy: {
            type: String,
            required: true,
        },
    },

    // Bank details
    bankDetails: {
        bankName: {
            type: String,
            required: true,
        },
        accountNumber: {
            type: String, // Use String to avoid precision issues
            required: true,
        },
        accountHolderName: {
            type: String,
            required: true,
        },
        ifscCode: {
            type: String,
            required: true,
        },
    },

    // Document uploads
    documents: {
        resume: {
            type: String,
            required: true,
        },
        idProof: {
            type: String,
            required: true,
        },
        additionalDocuments: {
            type: String,
            required: false,
        }
    },
    applicationStatus: {
        type: String,
        required: false,
        default: "pending"
    }

}, { timestamps: true });

export const Candidate = mongoose.model("Candidate", candidateSchema)
