import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
        },
        employmentType: {
            type: String,
            enum: ["Full-time", "Part-time", "Contract", "Internship"],
            required: true,
        },
        workLocationType: {
            type: String,
            enum: ["On-site", "Hybrid", "Remote"],
            required: true,
        },
        // Job details
        description: {
            type: String,
            required: true,
        },
        requiredSkills: {
            type: [String],
            required: true,
        },
        preferredSkills: {
            type: [String],
            default: [],
        },
        minimumQualification: {
            type: String,
            trim: true,
        },
        experienceRequired: {
            type: String, // e.g., "2-4 years"
            trim: true,
        },

        // Compensation & Benefits
        salaryMin: {
            type: Number,
            min: 0,
        },
        salaryMax: {
            type: Number,
            min: 0,
        },
        currency: {
            type: String,
            default: "INR",
        },
        applicationDeadline: {
            type: Date,
        },
        numberOfOpenings: {
            type: Number,
            min: 1,
            default: 1,
        },
        hiringManager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Assuming you have a User model
        },
        status: {
            type: String,
            enum: ["Draft", "Published", "Closed"],
            default: "Draft",
        }
    },
    { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
