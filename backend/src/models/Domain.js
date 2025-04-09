import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: Number,
      default: 1, // Higher number means higher priority
      min: 1,
      max: 10,
    },
    lastScraped: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
    scrapingInterval: {
      type: String,
      default: '0 */6 * * *', // Cron syntax (every 6 hours by default)
    },
  },
  {
    timestamps: true,
  }
);

const Domain = mongoose.model('Domain', domainSchema);

export default Domain;
