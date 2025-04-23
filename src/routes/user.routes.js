import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.js";
const router = Router();

router.route("/register").post(
  ///storing image in temp folder using multer
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "  coverImage", maxCount: 1 },
  ]),
  registerUser
);
// Express internally kuch aise karta hai:
/*app.on('POST /register', (req, res, next) => {
    registerUser(req, res, next);
 });*/

export default router;
