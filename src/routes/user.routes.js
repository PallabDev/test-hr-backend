import { Router } from "express";
import { getMe, loginUser, logoutUser, userRegistration, addEmployee } from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();
router.route("/registration").post(userRegistration)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/is-auth").get(verifyJWT, getMe)
router.route("/add-employee").post(verifyJWT, addEmployee)
export default router;