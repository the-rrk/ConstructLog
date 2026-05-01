// Local development server — mirrors Vercel routing locally.
// Usage: ANTHROPIC_API_KEY=sk-ant-... node server.js
import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import handler from './api/analyze.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));
app.post('/api/analyze', (req, res) => handler(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('ConstructLog running on http://localhost:' + PORT);
});
