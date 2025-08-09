import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { apply, getMe, getSubmissions, loginUser, logoutUser, updateCandidateStatus, userRegistration } from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();


router.route("/apply").post(upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },
    { name: 'additionalDocument', maxCount: 1 }
]),
    apply
)

router.route("/registration").post(userRegistration)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/get-submisison").get(verifyJWT, getSubmissions)
router.route("/is-auth").get(verifyJWT, getMe)
router.route("/update-status/:id").patch(verifyJWT, updateCandidateStatus)
export default router;