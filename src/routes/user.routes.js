import { Router } from "express";
import { getMe, loginUser, logoutUser, userRegistration, addEmployee, getApprovedEmployee, getEmployee, updateEmployeeSalary } from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();
router.route("/registration").post(userRegistration)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/is-auth").get(verifyJWT, getMe)
router.route("/add-employee").post(verifyJWT, addEmployee)
router.route("/approved-employees").get(verifyJWT, getApprovedEmployee)
router.route("/employees").get(verifyJWT, getEmployee); // get all employees or single by query param
router.route("/update-employee-salary").put(verifyJWT, updateEmployeeSalary); // update salary, allowances, incentives, deductions
export default router;