import mongoose from 'mongoose';

const keywordSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    priority: {
      type: Number,
      default: 1, // Higher number means higher priority
      min: 1,
      max: 10,
    },
    count: {
      type: Number,
      default: 0, // How many times this keyword was found in jobs
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Keyword = mongoose.model('Keyword', keywordSchema);

export default Keyword;
