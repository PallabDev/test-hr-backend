import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Candidate } from "../models/cadidate.model.js"

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";


const apply = asyncHandler(async (req, res) => {

    const {
        firstname,
        lastname,
        email,
        phone,
        address,
        dob,
        gender,
        highestQualification,
        instituteName,
        yearOfCompletion,
        fieldOfStudy,
        bankName,
        accountNumber,
        accountHolderName,
        ifscCode
    } = req.body;

    const files = req.files;
    console.log(req.body)
    // Required: resume and idProof (single), additionalDocuments (optional multiple)
    const resumeFile = files?.resume?.[0] || "";
    const idProofFile = files?.idProof?.[0] || "";
    const additionalDocs = files?.additionalDocument?.[0] || "";

    if (!resumeFile || !idProofFile) {
        return res.status(400).json(new ApiResponse(400, "Resume and ID Proof are required"));
    }

    const resumeUrl = `${BASE_URL}/temp/${resumeFile.filename}`;
    const idProofUrl = `${BASE_URL}/temp/${idProofFile.filename}`;
    const additionalDocUrls = `${BASE_URL}/temp/${additionalDocs.filename}`;

    const candidate = await Candidate.create({
        firstname,
        lastname,
        email,
        phone,
        address,
        dob,
        gender,
        qualification: {
            highestQualification,
            instituteName,
            yearOfCompletion,
            fieldOfStudy
        },
        bankDetails: {
            bankName,
            accountNumber,
            accountHolderName,
            ifscCode
        },
        documents: {
            resume: resumeUrl,
            idProof: idProofUrl,
            additionalDocuments: additionalDocUrls
        }
    });
    if (!candidate) {
        throw new ApiError(500, "Something went wrong during application process. Please try again later")
    }


    res.status(201).json(new ApiResponse(201, "Application submitted successfully", candidate));
})

const userRegistration = asyncHandler(async (req, res) => {
    const { email, fullName, password } = req.body;
    // check not empty
    if ([fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    //check if user already exists: userName, email
    const existedUser = await User.findOne({
        $or: [{ email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email already exists")
    }

    const user = await User.create({
        fullName,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email) {
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

// Example: controllers/userController.js

const getMe = asyncHandler(async (req, res) => {
    const userget = req.user;
    const user = await User.findById(userget._id).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(
        new ApiResponse(200, user, "User Authenticated")
    );
})



const getSubmissions = asyncHandler(async (req, res) => {
    const candidates = await Candidate.find().sort({ createdAt: -1 }); // newest first

    if (!candidates || candidates.length === 0) {
        return res.status(404).json(new ApiResponse(404, "No submissions found", []));
    }

    res.status(200).json(new ApiResponse(200, candidates, "Submissions fetched successfully",));
});

const updateCandidateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

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
    userRegistration,
    loginUser,
    logoutUser,
    getSubmissions,
    getMe,
    updateCandidateStatus
}