import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/serverConfig.js';
import { initializeScheduler } from './services/schedulerService.js';

// Connect to MongoDB
connectDB();

// Initialize scheduler
initializeScheduler();

// Start the server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
