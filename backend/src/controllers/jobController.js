import Job from '../models/Job.js';

class JobController {
  /**
   * Get all jobs with pagination and filtering
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getJobs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build query object
      const queryObj = {};

      // Filter by keyword
      if (req.query.keyword) {
        queryObj.keywords = { $in: [req.query.keyword] };
      }

      // Filter by company
      if (req.query.company) {
        queryObj.company = { $regex: req.query.company, $options: 'i' };
      }

      // Filter by title
      if (req.query.title) {
        queryObj.title = { $regex: req.query.title, $options: 'i' };
      }

      // Filter by domain/source URL
      if (req.query.source) {
        queryObj.sourceUrl = { $regex: req.query.source, $options: 'i' };
      }

      // Full text search
      if (req.query.search) {
        queryObj.$text = { $search: req.query.search };
      }

      // Date range
      if (req.query.from || req.query.to) {
        queryObj.scrapedAt = {};

        if (req.query.from) {
          queryObj.scrapedAt.$gte = new Date(req.query.from);
        }

        if (req.query.to) {
          queryObj.scrapedAt.$lte = new Date(req.query.to);
        }
      }

      // Execute query with pagination
      const jobs = await Job.find(queryObj)
        .sort({ scrapedAt: -1 })
        .skip(skip)
        .limit(limit);

      // Get total count
      const total = await Job.countDocuments(queryObj);

      res.status(200).json({
        success: true,
        count: jobs.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        jobs,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get a single job by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getJobById(req, res) {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.status(200).json({
        success: true,
        job,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete a job
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteJob(req, res) {
    try {
      const job = await Job.findByIdAndDelete(req.params.id);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Job deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get job statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getJobStats(req, res) {
    try {
      // Total job count
      const totalJobs = await Job.countDocuments();

      // Jobs by source domain
      const jobsBySource = await Job.aggregate([
        {
          $group: {
            _id: {
              $regexFind: { input: '$sourceUrl', regex: /https?:\/\/([^\/]+)/ },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            domain: {
              $ifNull: [{ $arrayElemAt: ['$_id.captures', 0] }, 'unknown'],
            },
            count: 1,
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      // Jobs by keyword
      const jobsByKeyword = await Job.aggregate([
        { $unwind: '$keywords' },
        {
          $group: {
            _id: '$keywords',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            keyword: '$_id',
            count: 1,
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      // Jobs by date
      const jobsByDate = await Job.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$scrapedAt' },
              month: { $month: '$scrapedAt' },
              day: { $dayOfMonth: '$scrapedAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day',
              },
            },
            count: 1,
          },
        },
        { $sort: { date: -1 } },
        { $limit: 30 },
      ]);

      res.status(200).json({
        success: true,
        stats: {
          totalJobs,
          jobsBySource,
          jobsByKeyword,
          jobsByDate,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new JobController();
