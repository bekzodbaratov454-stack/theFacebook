import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { ForbiddenException } from "../exceptions/forbidden.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../configs/cloudinary.config.js";

class UserController {
  #_userModel;

  constructor() {
    this.#_userModel = User;
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  search = async (req, res, next) => {
    try {
      const q = req.query.q?.trim();
      if (!q) return res.send({ success: true, data: [] });

      const safeQ = this.escapeRegex(q);
      const users = await this.#_userModel
        .find({
          $or: [
            { username: { $regex: safeQ, $options: "i" } },
            { name: { $regex: safeQ, $options: "i" } },
          ],
        })
        .select("name username avatar_url")
        .limit(20);

      res.send({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundException("Invalid user id");

      const user = await this.#_userModel.findById(id).select("-password");
      if (!user) throw new NotFoundException("User not found");

      res.send({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!req.user) throw new ForbiddenException("Unauthorized");
      if (!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundException("Invalid user id");

      const isOwner = id.toString() === req.user.id.toString();
      const isAdmin = req.user.role === "ADMIN";
      if (!isAdmin && !isOwner) throw new ForbiddenException("You can only update your own profile");

      const updateData = { ...req.body };
      delete updateData.password;
      if (!isAdmin) delete updateData.role;
      delete updateData.email;

      if (req.file) {
        const existingUser = await this.#_userModel.findById(id);
        if (existingUser?.avatar_url) {
          await deleteFromCloudinary(existingUser.avatar_url);
        }
        const b64 = req.file.buffer.toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        updateData.avatar_url = await uploadToCloudinary(dataURI, "blog/avatars");
      }

      const updatedUser = await this.#_userModel
        .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .select("-password");

      if (!updatedUser) throw new NotFoundException("User not found");

      res.send({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  };

  // Parol o'zgartirish
  changePassword = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid user id");

      const isOwner = id.toString() === req.user.id.toString();
      const isAdmin = req.user.role === "ADMIN";
      if (!isAdmin && !isOwner) throw new ForbiddenException("You can only change your own password");

      const { password } = req.body;
      if (!password || password.length < 6)
        throw new BadRequestException("Password must be at least 6 characters");

      const hashed = await bcrypt.hash(password, 10);
      await this.#_userModel.findByIdAndUpdate(id, { password: hashed });

      res.send({ success: true, message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();