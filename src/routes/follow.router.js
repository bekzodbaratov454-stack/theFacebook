import { Router } from "express";
import followController from "../controllers/follow.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const followRouter = Router();

followRouter
  .post("/:id/follow", authMiddleware, followController.follow)
  .delete("/:id/unfollow", authMiddleware, followController.unfollow)
  .get("/:id/followers", followController.getFollowers)
  .get("/:id/following", followController.getFollowing);

export default followRouter;