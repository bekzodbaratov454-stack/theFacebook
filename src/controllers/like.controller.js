import { NotFoundException } from "../exceptions/not-found.exception.js";
import { ForbiddenException } from "../exceptions/forbidden.exception.js";
import { Like } from "../models/like.model.js";
import { Post } from "../models/post.model.js";
import { createNotification } from "../helpers/notification.helper.js";


class likeController {
    #_likeModel;
    constructor() {
        this.#_likeModel = Like;
    }



create = async (req, res, next) => { 
    try { 
        const newLike = await this.#_likeModel.create({
            user: req.user.id,
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
                    type: "like",
                    reference: post._id,
                    message: `${req.user.username || "Someone"} liked your post`,
                });
            }
        }

        res.status(201).json({
            success: true,
            message: "Like bosildi ✅",
            data: newLike,
        });
    } catch (error) {
        console.error("Like create xatosi:", error);   // <-- Serverda to'liq ko'rish uchun

        // Duplicate like xatosi
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Siz bu postni allaqachon like qilgansiz!"
            });
        }

        // Boshqa xatolar (masalan, post mavjud emas, user yo'q va h.k.)
        next(error);
    }
};



    getAll = async (req, res, next) => { 
        try {
            const likes = await this.#_likeModel
                .find({ post: req.params.id })
                .populate("user", "name username");

            res.send({
                success: true,
                data: likes,
            });
        } catch (error) {
            next(error);
        }
    };





    delete = async (req, res, next) => { 
        try {
            const { id } = req.params;
            const like = await this.#_likeModel.findById(id);

            const isAdmin = req.user.role === "ADMIN";

            if (!like) throw new NotFoundException("Like Not Found");
            const isOwner = like.user.toString() === req.user.id;

            

            if (!isAdmin && !isOwner) {
                throw new ForbiddenException("You can only delete your own likes");
            }

            await this.#_likeModel.findByIdAndDelete(id);

            res.send({
                success: true,
                message: "Like deleted successfully",
            });
        } catch (error) {
            next(error); 
        }
    };
}


export default new likeController();