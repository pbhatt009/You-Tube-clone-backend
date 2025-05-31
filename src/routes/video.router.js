import { Router } from "express";
import { uploadvideo,getvideobyid,updatevideo,deleteVideo,changestatus,getallvideos } from "../controllers/videos.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/uploadVideo").post(
  verifyToken,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),

  uploadvideo
);
router.route("/getvideo/:id").get(
  verifyToken,
  getvideobyid
)
router.route("/:id/update").patch(
  verifyToken,
  upload.single("thumbnail"),
  updatevideo
)
router.route("/:id/delete").delete(
  verifyToken,
deleteVideo
)
router.route("/:id/changestatus").patch(
  verifyToken,
  changestatus
)
router.route("/getallvideos").get(
  verifyToken,
  getallvideos
)

export default router;
