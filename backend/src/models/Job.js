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
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  location: 'text',
});

// Add a method to check if a job matches certain keywords
jobSchema.methods.matchesKeywords = function (keywords) {
  const jobText =
    `${this.title} ${this.company} ${this.description}`.toLowerCase();
  return keywords.some((keyword) => jobText.includes(keyword.toLowerCase()));
};

const Job = mongoose.model('Job', jobSchema);

export default Job;
