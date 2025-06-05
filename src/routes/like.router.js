import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import{like,unlike} from "../controllers/like.controller.js"
const router=Router();
router.route("/addlike").post(
    verifyToken,
    like
)
router.route("/unlike/:likeid").delete(
     verifyToken,
     unlike
)
export default router;