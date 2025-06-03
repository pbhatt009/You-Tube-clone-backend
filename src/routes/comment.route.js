import { Router } from "express";
import{
    getallcomments,
    addComment,
    deleteComment,
    updateComment
} from "../controllers/comment.controller.js"
import {verifyToken} from "../middlewares/auth.middleware.js"
const router=Router();
router.route("/:videoid/addcomment",
    verifyToken,
    addComment
)
router.route("/:videoid/:commentid/update",
    verifyToken,
    updateComment
)
router.route("/:videoid/:commentid/delete",
    verifyToken,
    deleteComment
)
router.route("/:videoid/getcomments",
    verifyToken,
    getallcomments
)


export default router