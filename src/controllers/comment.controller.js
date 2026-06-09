import { ForbiddenException } from "../exceptions/forbidden.exception.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { createNotification } from "../helpers/notification.helper.js";

class commentController {
    #_commentModel;
    constructor() {
        this.#_commentModel = Comment;
    }

    create = async (req, res, next) => {
        try {
            const { text } = req.body;
            const newComment = await this.#_commentModel.create({
                text,
                author: req.user.id,
                post: req.params.id,
            });

            // Post egasiga notification yuborish
            const io = req.app.get("io");
            if (io) {
                const post = await Post.findById(req.params.id).select("author");
                if (post) {
                    await createNotification(io, {
                        recipient: post.author,
                        sender: req.user.id,
                        type: "comment",
                        reference: post._id,
                        message: `${req.user.username || "Someone"} commented on your post`,
                    });
                }
            }

            // Populate qilib qaytarish
            const populated = await newComment.populate("author", "name username avatar_url");
            res.send({ success: true, data: populated });
        } catch (error) {
            next(error);
        }
    };

    // Commentga reply
    reply = async (req, res, next) => {
        try {
            const { text } = req.body;
            const { commentId } = req.params;

            // Asl commentni topish
            const parentComment = await this.#_commentModel
                .findById(commentId)
                .populate("author", "name username");

            if (!parentComment) throw new NotFoundException("Comment not found");

            const newReply = await this.#_commentModel.create({
                text,
                author: req.user.id,
                post: parentComment.post,
                replyTo: commentId,
            });

            // Asl comment egasiga notification yuborish
            const io = req.app.get("io");
            if (io) {
                await createNotification(io, {
                    recipient: parentComment.author._id,
                    sender: req.user.id,
                    type: "reply",
                    reference: parentComment.post,
                    message: `${req.user.username || "Someone"} replied to your comment`,
                });
            }

            const populated = await newReply.populate([
                { path: "author", select: "name username avatar_url" },
                {
                    path: "replyTo",
                    select: "text author",
                    populate: { path: "author", select: "name username" },
                },
            ]);

            res.status(201).send({ success: true, data: populated });
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req, res, next) => {
        try {
            // Faqat top-level commentlarni olish (replyTo=null)
            const comments = await this.#_commentModel
                .find({ post: req.params.id, replyTo: null })
                .populate("author", "name username avatar_url")
                .sort({ createdAt: -1 });

            // Har bir comment uchun replylarni olish
            const commentsWithReplies = await Promise.all(
                comments.map(async (comment) => {
                    const replies = await this.#_commentModel
                        .find({ replyTo: comment._id })
                        .populate("author", "name username avatar_url")
                        .sort({ createdAt: 1 });
                    return { ...comment.toObject(), replies };
                })
            );

            res.send({ success: true, data: commentsWithReplies });
        } catch (error) {
            next(error);
        }
    };

    update = async (req, res, next) => {
        try {
            const { id } = req.params;
            const comment = await this.#_commentModel.findById(id);

            if (!comment) throw new NotFoundException("Comment not found");

            const isOwner = comment.author.toString() === req.user.id;
            const isAdmin = req.user.role === "ADMIN";

            if (!isOwner && !isAdmin) {
                throw new ForbiddenException("You can only update your own comments");
            }

            const { text } = req.body;
            const updatedComment = await this.#_commentModel.findByIdAndUpdate(
                id,
                { text },
                { new: true }
            );
            res.send({ success: true, data: updatedComment });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req, res, next) => {
        try {
            const { id } = req.params;
            const comment = await this.#_commentModel.findById(id);

            const isAdmin = req.user.role === "ADMIN";

            if (!comment) throw new NotFoundException("Comment Not found");
            const isOwner = comment.author.toString() === req.user.id;

            if (!isAdmin && !isOwner) {
                throw new ForbiddenException("You can only delete your own comments");
            }

            // Comment o'chirilsa, uning replylarini ham o'chirish
            await this.#_commentModel.deleteMany({ replyTo: id });
            await this.#_commentModel.findByIdAndDelete(id);

            res.send({ success: true, message: "Comment deleted successfully" });
        } catch (error) {
            next(error);
        }
    };
}

export default new commentController();