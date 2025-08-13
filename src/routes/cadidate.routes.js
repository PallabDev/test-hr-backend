import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { apply, getSubmissions, getSubmissionsById, updateCandidateStatus } from "../controller/cadidate.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/apply").post(
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "resume", maxCount: 1 },
        { name: "idProof", maxCount: 1 },
        { name: "galleryImages", maxCount: 10 },  // You can adjust maxCount as needed
        { name: "additionalDocument", maxCount: 1 }
    ]),
    apply
);

router.route("/get-submisison").get(verifyJWT, getSubmissions)
router.route("/get-submisison-by-id/:id").get(verifyJWT, getSubmissionsById)
router.route("/update-status/:id/:status").patch(verifyJWT, updateCandidateStatus);
export default router;