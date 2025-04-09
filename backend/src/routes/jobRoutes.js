import express from 'express';
import jobController from '../controllers/jobController.js';

const router = express.Router();

// Job routes
router.get('/', jobController.getJobs);
router.get('/stats', jobController.getJobStats);
router.get('/:id', jobController.getJobById);
router.delete('/:id', jobController.deleteJob);

export default router;
