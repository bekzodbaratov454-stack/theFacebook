import { ForbiddenException } from "../exceptions/forbidden.exception.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { sendEmail } from "../helpers/mail.helper.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../configs/cloudinary.config.js";

class PostController {
  #_postModel;

  constructor() {
    this.#_postModel = Post;
  }

  // Buffer dan cloudinary ga yuklash helper
  async #uploadFile(file, folder) {
    if (!file) return null;
    try {
      const b64 = file.buffer.toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      return await uploadToCloudinary(dataURI, folder);
    } catch (err) {
      console.error("❌ Cloudinary upload error:", err.message);
      throw new Error("Rasm yuklanmadi: " + err.message);
    }
  }

  create = async (req, res, next) => {
    try {
      const { title, content, created_by } = req.body;

      // Validation — FormData bilan req.body bo'sh kelishi mumkin
      if (!title || !title.trim()) {
        return res.status(400).send({ success: false, message: "Title is required" });
      }
      if (!content || !content.trim()) {
        return res.status(400).send({ success: false, message: "Content is required" });
      }

      const image_url = req.files?.image?.[0]
        ? await this.#uploadFile(req.files.image[0], "blog/posts")
        : null;

      const video_url = req.files?.video?.[0]
        ? await this.#uploadFile(req.files.video[0], "blog/videos")
        : null;

      const newPost = await this.#_postModel.create({
        title: title.trim(),
        content: content.trim(),
        author: req.user.id,
        created_by,
        image_url,
        video_url,
      });

      const populated = await newPost.populate("author", "name username age avatar_url");

      // Email xato bersa post yaratishga ta'sir qilmasin
      try {
        const user = await User.findById(req.user.id).select("email");
        if (user?.email) {
          await sendEmail(user.email, "Post created", "Siz yangi post yaratdingiz");
        }
      } catch (emailErr) {
        console.error("Email send failed (non-critical):", emailErr.message);
      }

      res.status(201).send({ success: true, data: populated });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const { sort } = req.query;
      let sortOption = { createdAt: -1 };
      if (sort === "oldest") sortOption = { createdAt: 1 };

      if (sort === "popular") {
        const posts = await this.#_postModel.aggregate([
          { $lookup: { from: "likes", localField: "_id", foreignField: "post", as: "likes" } },
          { $addFields: { likesCount: { $size: "$likes" } } },
          { $sort: { likesCount: -1 } },
          { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
          { $unwind: "$author" },
          { $project: { "author.password": 0, likes: 0 } },
        ]);
        return res.send({ success: true, data: posts });
      }

      const posts = await this.#_postModel
        .find()
        .populate("author", "name username age avatar_url")
        .sort(sortOption);

      res.send({ success: true, data: posts });
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req, res, next) => {
    try {
      const { id } = req.params;
      const post = await this.#_postModel.findById(id).populate("author", "name username age avatar_url");
      if (!post) throw new NotFoundException("Post Not Found");
      res.send({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const post = await this.#_postModel.findById(id);
      if (!post) throw new NotFoundException("Post not found");

      const isOwner = post.author.toString() === req.user.id;
      const isAdmin = req.user.role === "ADMIN";
      if (!isOwner && !isAdmin) throw new ForbiddenException("You can only update your own posts");

      const updateData = { ...req.body };

      if (req.files?.image?.[0]) {
        if (post.image_url) await deleteFromCloudinary(post.image_url);
        updateData.image_url = await this.#uploadFile(req.files.image[0], "blog/posts");
      }
      if (req.files?.video?.[0]) {
        if (post.video_url) await deleteFromCloudinary(post.video_url);
        updateData.video_url = await this.#uploadFile(req.files.video[0], "blog/videos");
      }

      const updatedPost = await this.#_postModel.findByIdAndUpdate(id, updateData, { new: true });
      res.send({ success: true, data: updatedPost });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const post = await this.#_postModel.findById(id);
      if (!post) throw new NotFoundException("Post not found");

      const isAdmin = req.user.role === "ADMIN";
      const isOwner = post.author.toString() === req.user.id;
      if (!isAdmin && !isOwner) throw new ForbiddenException("You can only delete your own posts");

      if (post.image_url) await deleteFromCloudinary(post.image_url);
      if (post.video_url) await deleteFromCloudinary(post.video_url);

      await this.#_postModel.findByIdAndDelete(id);
      res.send({ success: true, message: "Post deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export default new PostController();