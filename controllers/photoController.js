import User from '../schema/user.js';
import Photo from '../schema/photo.js';
import isValidObjectId from '../utils/validation.js';

export default async function getPhotosOfUser(req, res) {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const users = await User.find({}, '_id first_name last_name').lean();
    if (!users) {
      return res.status(404).send('No users found');
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
