import { Router } from "express";
import commentController from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../middlewares/validation.middleware.js";
import { CommentSchema } from "../schemas/comment.schema.js";

const commentRouter = Router();

commentRouter
    .post("/:id/comments", authMiddleware, ValidationMiddleware(CommentSchema), commentController.create)
    .get("/:id/comments", commentController.getAll)
    .post("/comments/:commentId/reply", authMiddleware, ValidationMiddleware(CommentSchema), commentController.reply)
    .put("/comments/:id", authMiddleware, ValidationMiddleware(CommentSchema), commentController.update)
    .delete("/comments/:id", authMiddleware, commentController.delete);

export default commentRouter;