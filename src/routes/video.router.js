import { Router } from "express";
import { uploadvideo,getvideobyid,updatevideo,deleteVideo,changestatus,getallvideos,increseview,getallminevideos } from "../controllers/videos.controller.js";
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

  getallvideos
)
router.route("/getallminevideos").get(
 verifyToken,
  getallminevideos
)
 
router.route("/:id/increseview").patch(
  verifyToken,
  increseview
)

export default router;
