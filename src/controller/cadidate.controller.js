import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Candidate } from "../models/cadidate.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const apply = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        phone,
        address,
        dob,
        institute,
        specialization,
        achievements,
        jobId,
        bankName,
        accountNumber,
        accountHolderName,
        ifscCode,
        panCardNumber,
        aadhaarCardNumber
    } = req.body;

    if (!req.files) {
        return res.status(400).json({ message: "Files are required" });
    }

    const photoFile = req.files.photo?.[0];
    const resumeFile = req.files.resume?.[0];
    const idProofFile = req.files.idProof?.[0];
    const galleryFiles = req.files.galleryImages || [];

    if (!photoFile || !resumeFile || !idProofFile) {
        return res.status(400).json({ message: "Photo, Resume and ID Proof are required" });
    }

    const userExist = await Candidate.findOne({ email });
    if (userExist) {
        throw new ApiError(409, "User with email already exists");
    }

    // Upload files to Cloudinary
    const photoUpload = await uploadOnCloudinary(photoFile.path);
    const resumeUpload = await uploadOnCloudinary(resumeFile.path);
    const idProofUpload = await uploadOnCloudinary(idProofFile.path);

    // Upload gallery images (if any)
    const galleryUploads = [];
    for (const file of galleryFiles) {
        const uploadResult = await uploadOnCloudinary(file.path);
        if (uploadResult?.url) {
            galleryUploads.push(uploadResult.url);
        }
    }

    // Create candidate document
    const candidate = await Candidate.create({
        name,
        email,
        phone,
        address,
        dob,
        applyFor: jobId,
        education: {
            institute,
            specialization,
        },
        achievements,
        bankDetails: {
            bankName,
            accountNumber,
            accountHolderName,
            ifscCode
        },
        documentNumbers: {
            panCardNumber,
            aadhaarCardNumber
        },
        photoUrl: photoUpload.url,
        documents: {
            resumeUrl: resumeUpload.url,
            idProofUrl: idProofUpload.url,
        },
        galleryImages: galleryUploads,
    });

    res.status(201).json({
        message: "Application submitted successfully",
        candidate,
    });
});


const getSubmissions = asyncHandler(async (req, res) => {
    const candidates = await Candidate.find().sort({ createdAt: -1 }); // newest first

    if (!candidates || candidates.length === 0) {
        return res.status(404).json(new ApiResponse(404, "No submissions found", []));
    }

    res.status(200).json(new ApiResponse(200, candidates, "Submissions fetched successfully",));
});

const getSubmissionsById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const candidate = await Candidate.findById(id);
    if (!candidate) {
        throw new ApiError(404, "Candidate not found");
    }

    res.status(200).json(new ApiResponse(200, candidate, "Candidate fetched successfully"));
});

const updateCandidateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.params;

    // Validate input
    if (!status || !["approved", "rejected", "pending"].includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
        throw new ApiError(404, "Candidate not found");
    }

    candidate.applicationStatus = status;
    await candidate.save();

    res.status(200).json(new ApiResponse(200, candidate, "Status updated successfully"));
});


export {
    apply,
    getSubmissions,
    getSubmissionsById,
    updateCandidateStatus
}