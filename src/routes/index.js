import { Router } from "express";
import blogRouter from "./blog.router.js";
import postRouter from "./post.router.js";
import commentRouter from "./comment.router.js";
import userRouter from "./user.router.js"; 
import likeRouter from "./like.router.js";
import viewRouter from "./view.router.js";
import followRouter from "./follow.router.js";
import notificationRouter from "./notification.router.js";
import chatRouter from "./chat.router.js";
import adminRouter from "./admin.router.js";
import conversationRouter from "./conversation.router.js";


const apiRouter = Router();
apiRouter.use("/posts" , commentRouter);
apiRouter.use("/posts", likeRouter);
apiRouter.use("/blog", blogRouter);
apiRouter.use("/posts", viewRouter);  
apiRouter.use("/posts", postRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/users", followRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/chat", conversationRouter);


export default apiRouter;
