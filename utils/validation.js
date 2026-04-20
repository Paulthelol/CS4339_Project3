import mongoose from 'mongoose';

export default function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
