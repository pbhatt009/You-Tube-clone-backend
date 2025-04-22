import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
const router = Router();

router.route("/register").post(registerUser);
// Express internally kuch aise karta hai:
/*app.on('POST /register', (req, res, next) => {
    registerUser(req, res, next);
 });*/

export default router;
