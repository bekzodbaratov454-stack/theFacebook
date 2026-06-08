import { Follow } from "../models/follow.model.js";
import { User } from "../models/user.model.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { createNotification } from "../helpers/notification.helper.js";

class FollowController {
  follow = async (req, res, next) => {
    try {
      const { id } = req.params;
      const followerId = req.user.id;

      if (id === followerId) {
        throw new BadRequestException("You cannot follow yourself");
      }

      const targetUser = await User.findById(id);
      if (!targetUser) throw new NotFoundException("User not found");

      await Follow.create({ follower: followerId, following: id });

      // Notification yuborish (io main.js dan req orqali keladi)
      const io = req.app.get("io");
      if (io) {
        await createNotification(io, {
          recipient: id,
          sender: followerId,
          type: "follow",
          message: `${req.user.username || "Someone"} started following you`,
        });
      }

      res.send({ success: true, message: "Followed successfully" });
    } catch (error) {
      if (error.code === 11000) {
        return next(new ConflictException("You are already following this user"));
      }
      next(error);
    }
  };

  unfollow = async (req, res, next) => {
    try {
      const { id } = req.params;
      const followerId = req.user.id;

      const result = await Follow.findOneAndDelete({
        follower: followerId,
        following: id,
      });

      if (!result) throw new NotFoundException("You are not following this user");

      res.send({ success: true, message: "Unfollowed successfully" });
    } catch (error) {
      next(error);
    }
  };

  getFollowers = async (req, res, next) => {
    try {
      const { id } = req.params;
      const follows = await Follow.find({ following: id })
        .populate("follower", "name username avatar_url");

      res.send({ success: true, data: follows.map(f => f.follower) });
    } catch (error) {
      next(error);
    }
  };

  getFollowing = async (req, res, next) => {
    try {
      const { id } = req.params;
      const follows = await Follow.find({ follower: id })
        .populate("following", "name username avatar_url");

      res.send({ success: true, data: follows.map(f => f.following) });
    } catch (error) {
      next(error);
    }
  };
}

export default new FollowController();
