/**
 * Simple API server to serve Supabase data to Shiny app
 * Runs on port 5174 (separate from Vite dev server)
 */

import express from 'express';
import cors from 'cors';
import { getBannerPlansForProject, getQuestionsForProject } from './src/api/crosstabs.js';

const app = express();
const PORT = 5174;

// Enable CORS for Shiny app
app.use(cors({
  origin: ['http://localhost:8888', 'http://127.0.0.1:8888'],
  credentials: true
}));

app.use(express.json());

// Get banner plans for project
app.get('/api/projects/:projectId/banners', async (req, res) => {
  const { projectId } = req.params;
  const result = await getBannerPlansForProject(projectId);

  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Get questions for project
app.get('/api/projects/:projectId/questions', async (req, res) => {
  const { projectId } = req.params;
  console.log(`[API] Fetching questions for project: ${projectId}`);
  const result = await getQuestionsForProject(projectId);

  if (result.success) {
    console.log(`[API] SUCCESS: Found ${result.data.length} questions`);
    res.json(result.data);
  } else {
    console.error(`[API] ERROR: ${result.error}`);
    res.status(500).json({ error: result.error });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Cross-tabs API', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Cross-tabs API server running on http://localhost:${PORT}`);
  console.log(`📡 Serving Supabase data to Shiny app`);
});

export default app;