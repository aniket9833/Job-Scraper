import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },

    link: {
      type: String,
      // Remove the unique constraint or ensure it's never null
      sparse: true, // This makes the unique index ignore null values
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    postedDate: {
      type: Date,
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create a text index for full-text search
jobSchema.index({ url: 1, title: 1, company: 1 }, { unique: true });

jobSchema.pre('save', function (next) {
  // If link is null, generate a pseudo-unique identifier
  if (!this.link) {
    this.link = `no-link-${this._id}-${Date.now()}`;
  }
  next();
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
