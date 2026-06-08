import { Router } from "express";
import viewController from "../controllers/view.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { Roles } from "../middlewares/roles.middleware.js";

const viewRouter = Router();

viewRouter.post("/:id/view", authMiddleware, viewController.addView);

viewRouter.get("/:id/views", viewController.getViewsCount);

viewRouter.get(
  "/:id/views/details",
  authMiddleware,
  Roles("ADMIN"),
  viewController.getViewsDetails
);

export default viewRouter;