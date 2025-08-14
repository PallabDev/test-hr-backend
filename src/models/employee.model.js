import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema({
    photoUrl: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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
    bankDetails: {
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountHolderName: { type: String, required: true },
        ifscCode: { type: String, required: true }
    },

    documentNumbers: {
        panCardNumber: { type: String, required: true },
        aadhaarCardNumber: { type: String, required: true }
    },
    salary: {
        type: Number,
        required: true,
        default: 0
    },
    allowances: {
        hra: { type: Number, default: 0 },
        conveyance: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
    },
    incentives: {
        monthly: { type: Number, default: 0 },
        yearly: { type: Number, default: 0 },
    },
    deductions: {
        pf: { type: Number, default: 0 },
        tds: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    netSalary: {
        type: Number,
        default: 0
    }


}, { timestamps: true });

export const Employee = mongoose.model("Employee", employeeSchema);
