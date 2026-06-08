import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../configs/multer.config.js";
import viewController from "../controllers/view.controller.js";

const userRouter = Router();

userRouter.get("/me/views", authMiddleware, viewController.getMyViews);
userRouter.get("/search", userController.search);


userRouter
    .get("/:id", authMiddleware, userController.getOne)
    .put("/:id", authMiddleware, upload.single("image"), userController.update);

export default userRouter;