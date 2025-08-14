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

const addEmployee = asyncHandler(async (req, res) => {
    const { id } = req.user;

    // Check admin
    const isAdminUser = await User.findById(id);
    if (!isAdminUser || isAdminUser.role !== "admin") {
        throw new ApiError(403, "Unauthorized Request");
    }

    const { candidateId, salary } = req.body;
    console.log(candidateId, salary)
    // Fetch candidate
    const candidateUser = await Candidate.findById(candidateId);
    if (!candidateUser) {
        throw new ApiError(404, "Candidate not found");
    }

    if (candidateUser.applicationStatus !== "approved") {
        throw new ApiError(400, "Candidate is not approved yet");
    }

    const {
        name,
        email,
        phone,
        address,
        documents,
        dob,
        education,
        photoUrl,
        bankDetails,
        documentNumbers,
    } = candidateUser;

    // Create user account
    const newUser = await User.create({
        fullName: name,
        email: email,
        password: generatePassword(name, dob),
        role: "employee" // optionally set role
    });

    // Create employee record
    const newEmployee = await Employee.create({
        fullName: name,
        phone,
        address,
        documents,
        dob,
        education,
        photoUrl,
        documentNumbers,
        bankDetails,
        salary,
        userId: newUser._id
    });

    if (!newUser || !newEmployee) {
        throw new ApiError(500, "Something went wrong. Employee not created!");
    }

    // Delete candidate after successful creation
    await Candidate.findByIdAndDelete(candidateId);

    res.status(201).json(
        new ApiResponse(200, newUser, "Employee created successfully!")
    );
});


const getApprovedEmployee = asyncHandler(async (req, res) => {
    const { id } = req.user;

    // Check admin
    const isAdminUser = await User.findById(id);
    if (!isAdminUser || isAdminUser.role !== "admin") {
        throw new ApiError(403, "Unauthorized Request");
    }

    // Aggregation to get approved candidates with job details
    const approvedCandidates = await Candidate.aggregate([
        { $match: { applicationStatus: "approved" } }, // only approved
        { $unwind: "$applyFor" },                        // unwind applyFor array
        {
            $lookup: {
                from: "jobs",            // MongoDB collection name for jobs
                localField: "applyFor", // candidate's job id
                foreignField: "_id",    // job _id
                as: "jobDetails"
            }
        },
        { $unwind: "$jobDetails" }, // flatten jobDetails array
        {
            $project: {
                _id: 1,
                name: 1,
                email: 1,
                applicationStatus: 1,
                bankDetails: 1,
                documentNumbers: 1,
                photoUrl: 1,
                jobDetails: 1
            }
        }
    ]);

    if (!approvedCandidates || approvedCandidates.length === 0) {
        throw new ApiError(404, "No approved candidates found");
    }

    res.status(200).json(
        new ApiResponse(200, { approvedCandidates }, "Approved Candidates Fetched Successfully!")
    );
});





// Get all employees or a single employee by ID
const getEmployee = asyncHandler(async (req, res) => {
    const { id } = req.user;

    // Check admin
    const isAdminUser = await User.findById(id);
    if (!isAdminUser || isAdminUser.role !== "admin") {
        throw new ApiError(403, "Unauthorized Request");
    }

    const { employeeId } = req.query; // optional filter

    let matchStage = {};
    if (employeeId) {
        matchStage = { _id: new mongoose.Types.ObjectId(employeeId) };
    }

    const employees = await Employee.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "users", // collection name in MongoDB
                localField: "userId", // field in Employee that references User
                foreignField: "_id",
                as: "userDetails"
            }
        },
        { $unwind: "$userDetails" },
        {
            $project: {
                _id: 1,
                userId: 1,
                fullName: "$userDetails.fullName",
                phone: 1,
                email: "$userDetails.email",
                salary: 1,
                allowances: 1,
                incentives: 1,
                deductions: 1,
                netSalary: 1
            }
        }
    ]);

    console.log(employees)
    if (employeeId && employees.length === 0) {
        throw new ApiError(404, "Employee not found");
    }

    res.status(200).json(
        new ApiResponse(200, employees, "Employee(s) fetched successfully")
    );
});


// Update employee salary section
const updateEmployeeSalary = asyncHandler(async (req, res) => {
    const { id } = req.user;

    // Check admin
    const isAdminUser = await User.findById(id);
    if (!isAdminUser || isAdminUser.role !== "admin") {
        throw new ApiError(403, "Unauthorized Request");
    }

    const { employeeId, salary, allowances, incentives, deductions } = req.body;
    if (!employeeId) throw new ApiError(400, "employeeId is required");

    const employee = await Employee.findById(employeeId);
    if (!employee) throw new ApiError(404, "Employee not found");

    // -----------------------------
    // Update salary fields intelligently
    // -----------------------------
    if (salary !== undefined) employee.salary = salary;

    if (allowances) {
        for (const key in allowances) {
            employee.allowances[key] = (employee.allowances[key] || 0) + allowances[key];
        }
    }

    if (incentives) {
        for (const key in incentives) {
            employee.incentives[key] = (employee.incentives[key] || 0) + incentives[key];
        }
    }

    if (deductions) {
        for (const key in deductions) {
            employee.deductions[key] = (employee.deductions[key] || 0) + deductions[key];
        }
    }

    // -----------------------------
    // Recalculate netSalary
    // -----------------------------
    const totalAllowances = Object.values(employee.allowances).reduce((a, b) => a + b, 0);
    const totalIncentives = Object.values(employee.incentives).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(employee.deductions).reduce((a, b) => a + b, 0);

    employee.netSalary = employee.salary + totalAllowances + totalIncentives - totalDeductions;

    await employee.save();

    res.status(200).json(
        new ApiResponse(200, employee, "Employee salary updated successfully")
    );
});

export {
    userRegistration,
    loginUser,
    logoutUser,
    getMe,
    addEmployee,
    getApprovedEmployee,
    getEmployee,
    updateEmployeeSalary
};
