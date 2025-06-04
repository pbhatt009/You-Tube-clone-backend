import { Router } from "express";
import{
    getallcomments,
    addComment,
    deleteComment,
    updateComment
} from "../controllers/comment.controller.js"
import {verifyToken} from "../middlewares/auth.middleware.js"
const router=Router();
router.route("/:videoid/addcomment").post(
    verifyToken,
    addComment
)
router.route("/:videoid/:commentid/update").patch(
    verifyToken,
    updateComment
)
router.route("/:videoid/:commentid/delete").delete(
    verifyToken,
    deleteComment
)
router.route("/:videoid/getcomments").get(
    verifyToken,
    getallcomments
)


export default router