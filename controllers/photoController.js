import mongoose from "mongoose";
import User from "../schema/user.js";
import Photo from "../schema/photo.js";
import isValidObjectId from "../utils/validation.js";

export async function getPhotosOfUser(req, res) {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send("Invalid user id");
    }

    const users = await User.find({}, "_id first_name last_name").lean();
    if (!users) {
      return res.status(404).send("No users found");
    }

    const photos = await Photo.find({ user_id: userId }).lean();
    if (!photos) {
      return res.json([]);
    }

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
      };
    });

    const responsePhotos = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: (photo.comments || []).map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: userMap[comment.user_id?.toString()] || null,
      })),
    }));

    return res.json(responsePhotos);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function addComment(req, res) {
  try {
    // Data definition:
    const userId = req.session.user;
    const photoId = req.params.id;
    const { comment } = req.body;

    // Inital sanitization
    if (userId === undefined || userId === null) {
      return res.status(401).send("Unauthorized");
    }

    if (photoId === undefined || photoId === null) {
      return res.status(404).send("Not Found");
    }

    if (comment === undefined || comment === null) {
      return res.status(400).send("Bad Request");
    }

    // Fetch the image to comment on
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).send("Photo not found");
    }

    // Add the comment to the photo
    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      comment,
      date_time: new Date(),
      user_id: userId,
    };

    photo.comments = photo.comments || [];
    photo.comments.push(newComment);
    await photo.save();
    return res.status(200).json(newComment);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function uploadPhoto(req, res) {
  try{
    const userId = req.session.user;
    const { url } = req.body;
    if (userId === undefined || userId === null) {
      return res.status(401).send("Unauthorized");
    }

    if (url === undefined || url === null) {
      return res.status(400).send("Bad Request");
    }

    const newPhoto = {
      _id: new mongoose.Types.ObjectId(),
      user_id: userId,
      file_name: url,
      date_time: new Date(),
      comments: [],
    };

    await Photo.create(newPhoto);
    return res.status(200).json(newPhoto);

  } catch (err) {
    return res.status(500).send(err.message);
  }
}
