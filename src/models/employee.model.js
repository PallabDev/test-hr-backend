import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema({
    photoUrl: {
        type: String,
        required: true,
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

}, { timestamps: true });

export const Employee = mongoose.model("Employee", employeeSchema);
