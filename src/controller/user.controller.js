import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Candidate } from "../models/cadidate.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

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
    } = req.body;

    // multer puts files in req.files as arrays
    // Expect files with keys: photo, resume, idProof, galleryImages (multiple)

    if (!req.files) {
        return res.status(400).json({ message: "Files are required" });
    }

    // Validate required files
    const photoFile = req.files.photo?.[0];
    const resumeFile = req.files.resume?.[0];
    const idProofFile = req.files.idProof?.[0];
    const galleryFiles = req.files.galleryImages || [];

    if (!photoFile || !resumeFile || !idProofFile) {
        return res.status(400).json({ message: "Photo, Resume and ID Proof are required" });
    }

    const userExist = await Candidate.findOne({ email: email })
    if (userExist) {
        throw new ApiError(409, "User with email already exists")
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

    // Delete local files after upload (optional if you didn't do it in uploader)
    // fs.unlinkSync(photoFile.path); and same for others

    // Create candidate document
    const candidate = await Candidate.create({
        name,
        email,
        phone,
        address,
        dob,
        education: {
            institute,
            specialization,
        },
        achievements,
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
    userRegistration,
    loginUser,
    logoutUser,
    getSubmissions,
    getSubmissionsById,
    getMe,
    updateCandidateStatus
}