import { Router } from "express";
import likeController from "../controllers/like.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const likeRouter = Router();

likeRouter
    .post("/:id/likes", authMiddleware, likeController.create)
    .get("/:id/likes", likeController.getAll)
    .delete("/likes/:id", authMiddleware, likeController.delete);

export default likeRouter;