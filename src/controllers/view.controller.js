import { View } from "../models/view.model.js";
import { Post } from "../models/post.model.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";

class viewController {
  #_viewModel;
  #_postModel;

  constructor() {
    this.#_viewModel = View;
    this.#_postModel = Post;
  }


  addView = async (req, res, next) => {
    try {
      const { id: postId } = req.params;
      const userId = req.user.id;

      const post = await this.#_postModel.findById(postId);
      if (!post) throw new NotFoundException("Post not found");

      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        null;

      await this.#_viewModel.updateOne(
        { post: postId, user: userId },
        {
          $setOnInsert: {
            post: postId,
            user: userId,
            viewedAt: new Date(),
            ip,
          },
        },
        { upsert: true }
      );

      const viewsCount = await this.#_viewModel.countDocuments({ post: postId });

      res.send({
        success: true,
        data: { views: viewsCount },
      });
    } catch (error) {
      next(error);
    }
  };






  getViewsCount = async (req, res, next) => {
    try {
      const { id: postId } = req.params;

      const post = await this.#_postModel.findById(postId);
      if (!post) throw new NotFoundException("Post not found");

      const viewsCount = await this.#_viewModel.countDocuments({ post: postId });

      res.send({
        success: true,
        data: { postId, views: viewsCount },
      });
    } catch (error) {
      next(error);
    }
  };







  getViewsDetails = async (req, res, next) => {
    try {
      const { id: postId } = req.params;

      const post = await this.#_postModel.findById(postId);
      if (!post) throw new NotFoundException("Post not found");

      const views = await this.#_viewModel
        .find({ post: postId })
        .populate("user", "name username email avatar_url")
        .sort({ viewedAt: -1 });

      res.send({
        success: true,
        data: {
          postId,
          totalViews: views.length,
          views,
        },
      });
    } catch (error) {
      next(error);
    }
  };




  
  getMyViews = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const views = await this.#_viewModel
        .find({ user: userId })
        .populate("post", "title content image_url createdAt")
        .sort({ viewedAt: -1 });

      res.send({
        success: true,
        data: {
          totalViews: views.length,
          views,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new viewController();