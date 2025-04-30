import { Router } from "express";
import { subscription,unsubscription } from "../controllers/subscripition.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

  router.route("/channel/:channelname/subscribe").post(verifyToken,subscription)

  router.route("/channel/:channelname/unsubscribe").post(verifyToken,unsubscription)
  export default router;