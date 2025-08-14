import { Job } from "../models/job.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { User } from "../models/user.model.js";

/**
 * @desc    Create a new job posting
 * @route   POST /api/v1/jobs/create-jobs
 * @access  Private (Admin / HR only)
 */
export const createJob = asyncHandler(async (req, res) => {
    const {
        title,
        employmentType,
        workLocationType,
        description,
        requiredSkills,
        preferredSkills,
        minimumQualification,
        experienceRequired,
        salaryMin,
        salaryMax,
        currency,
        applicationDeadline,
        numberOfOpenings,
        status
    } = req.body;

    // Basic validation
    if (!title || !employmentType || !workLocationType || !description || !requiredSkills?.length) {
        throw new ApiError(400, "Please fill all required fields (title, employmentType, workLocationType, description, requiredSkills)");
    }

    const hiringManager = req.user;
    if (!hiringManager && (hiringManager.role !== "admin")) {
        throw new ApiError(401, "Unauthorized: No logged-in user found");
    }

    const newJob = await Job.create({
        title,
        employmentType,
        workLocationType,
        description,
        requiredSkills,
        preferredSkills: preferredSkills || [],
        minimumQualification,
        experienceRequired,
        salaryMin,
        salaryMax,
        currency: currency || "INR",
        applicationDeadline,
        numberOfOpenings: numberOfOpenings || 1,
        hiringManager,
        status: status || "Draft"
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newJob, "Job created successfully"));
});

/**
 * @desc    Get all jobs
 * @route   GET /api/v1/jobs/all-jobs
 * @access  Public
 */
export const getJobs = asyncHandler(async (_, res) => {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
});

/**
 * @desc    Get single job by ID
 * @route   GET /api/v1/jobs/:id
 * @access  Public
 */
export const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, job, "Job fetched successfully"));
});


/**
 * @desc    Update job status
 * @route   PATCH /api/v1/jobs/:id/:status
 * @access  Private (Admin / HR only)
 */
export const updateJobStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.params;

    // Validate status
    const allowedStatuses = ["Draft", "Published", "Closed"];
    if (!allowedStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`);
    }

    const job = await Job.findById(id);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Optional: Check if current user is the hiring manager or admin
    if (String(job.hiringManager) !== String(req.user._id)) {
        throw new ApiError(403, "You are not authorized to update this job status");
    }

    job.status = status;
    await job.save();

    return res
        .status(200)
        .json(new ApiResponse(200, job, `Job status updated to "${status}" successfully`));
});

