import { Router } from "express";
import postController from "../controllers/post.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../configs/multer.config.js";

const postRouter = Router();

postRouter
    .post("/", authMiddleware, upload.fields([{ name: "image" }, { name: "video" }]), postController.create)
    .get("/", postController.getAll)
    .get("/:id", postController.getOne)
    .put("/:id", authMiddleware, upload.fields([{ name: "image" }, { name: "video" }]), postController.update)
    .delete("/:id", authMiddleware, postController.delete);

export default postRouter;