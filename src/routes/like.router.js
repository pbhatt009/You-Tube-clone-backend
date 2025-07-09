import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import{like,unlikevideo,unlikecomment} from "../controllers/like.controller.js"
const router=Router();
router.route("/addlike").post(
    verifyToken,
    like
)
router.route("/unlikevideo/:id").delete(
     verifyToken,
     unlikevideo
)
router.route("/unlikecomment/:id").delete(
     verifyToken,
     unlikecomment
)
export default router;