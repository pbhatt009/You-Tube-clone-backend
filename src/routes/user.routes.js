import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenUpdate,
  changePassword,
  getcurrentUser,
  updateUser,
  updateAvatar,
  updateCoverImage,
  getuserchannel,
  getwatchHistory,
  updatewatchhistory,
} from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  ///storing image in temp folder using multer

  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),

  registerUser
);

//internally working
/*app.on('POST /register', (req, res, next) => {
    registerUser(req, res, next);
 });*/

router.route("/login").post(loginUser);
///secured route routes after login
router.route("/logout").post(verifyToken, logoutUser);
router.route("/refresh-token").post(refreshTokenUpdate);
router.route("/change-password").post(verifyToken, changePassword);
router.route("/current-user").get(verifyToken, getcurrentUser);
////updates only info of user not  avatar or cover image
router.route("/update-user").patch(verifyToken, updateUser);
router
  .route("/update-avatar")
  .patch(verifyToken, upload.single("avatar"), updateAvatar);
router
  .route("/update-cover")
  .patch(verifyToken, upload.single("coverImage"), updateCoverImage);

router.route("/channel/:username").get(verifyToken, getuserchannel);

router.route("/watchHistory").get(verifyToken, getwatchHistory);

router
  .route("/UpdateWatchHistory/:videoid")
  .patch(verifyToken, updatewatchhistory);
export default router;
