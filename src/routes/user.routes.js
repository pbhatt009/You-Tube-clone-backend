import { Router } from "express";
import { registerUser,loginUser,logoutUser,  refreshTokenUpdate,changePassword} from "../controllers/user.controllers.js";
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

// Express internally kuch aise karta hai:
/*app.on('POST /register', (req, res, next) => {
    registerUser(req, res, next);
 });*/

 router.route("/login").post(
   
  loginUser
)
///secured route routes after login
router.route("/logout").post(
    verifyToken,
    logoutUser
)
router.route("/refresh-token").post(
  refreshTokenUpdate
);
router.route("/change-password").post(
  
  verifyToken,
  changePassword


);

export default router;
