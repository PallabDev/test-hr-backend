import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createJob, getJobById, getJobs, updateJobStatus } from "../controller/job.controller.js";
const router = Router();


router.route("/create-job").post(verifyJWT, createJob);
router.route("/all-jobs").get(getJobs);
router.route("/:id").get(getJobById);
router.route("/:id/:status").get(updateJobStatus);


export default router;