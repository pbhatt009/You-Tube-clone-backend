import { Router } from "express";
import { uploadvideo } from "../controllers/videos.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/uploadVideo").post(
    verifyToken,
  upload.fields([
      {name:"videoFile",maxCount:1},
      {name:"thumbnail",maxCount:1}
    ]),
  
    uploadvideo
    )





    export default router;
    