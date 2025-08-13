import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Candidate } from "../models/cadidate.model.js"
import { Employee } from "../models/employee.model.js"


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
function generatePassword(name, dob) {
    // Extract first name
    const firstName = name.split(" ")[0].toLowerCase();

    // Extract year from Date object or string
    const birthYear = new Date(dob).getFullYear();

    // Combine
    return `${firstName}${birthYear}`;
}

const addJob = asyncHandler(async (req, res) => {
    const { id } = req.user
    const adminUser = await User.findById(id);
    if (!adminUser && (adminUser.role !== "admin")) {
        throw new ApiError(400, "Unauthorized Request!");
    }


})

const addEmployee = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const isAdminUser = await User.findOne({ _id: id });
    if (!isAdminUser && isAdminUser.role !== "admin") {
        throw new ApiError(404, "Unauthorized Request");
    }
    const { cadidateId } = req.body;
    const candidateUser = await Candidate.findOne({ _id: cadidateId });
    if (!candidateUser) {
        throw new ApiError(404, "Candidate not found");
    }
    if (candidateUser.applicationStatus !== "approved") {
        throw new ApiError(400, "Candidate is not approved yet");
    }
    const { name, email, phone, address, documents, dob, education, photoUrl } = candidateUser;

    const newUser = await User.create({
        fullName: name,
        email: email,
        password: generatePassword(name, dob)
    })
    const newEmployee = await Employee.create({
        phone, address, documents, dob, education, photoUrl
    })

    if (!newUser && !newEmployee) {
        throw new ApiError(500, "Something Went wrong employee not created!");
    }
    await Candidate.findByIdAndDelete(cadidateId);
    res.status(201).json(
        new ApiResponse(200, newUser, "Employee Created successfully!")
    );
})


export {
    userRegistration,
    loginUser,
    logoutUser,
    getMe,
    addEmployee
}