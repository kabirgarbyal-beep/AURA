import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Handle ES module __dirname resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'dossiers.json');

// Ensure database directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Utility to read dossiers
function readDossiers() {
  try {
    const rawData = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Error reading dossier database:', err);
    return [];
  }
}

// Utility to write dossiers
function writeDossiers(data: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to dossier database:', err);
    return false;
  }
}

async function startServer() {
  const app = express();

  // Parse JSON payloads
  app.use(express.json());

  // ───────────────── API ENDPOINTS ─────────────────

  // Get all dossiers
  app.get('/api/dossiers', (req, res) => {
    const dossiers = readDossiers();
    res.json({ success: true, dossiers });
  });

  // Post a new dossier
  app.post('/api/dossiers', (req, res) => {
    const { name, email, message, bureau } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required fields.' });
    }

    const dossiers = readDossiers();
    const newDossier = {
      id: `dos_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name,
      email,
      message: message || '',
      bureau: bureau || 'Milan',
      timestamp: new Date().toISOString()
    };

    dossiers.unshift(newDossier); // Add to the beginning so newest appears first
    const writeSuccess = writeDossiers(dossiers);

    if (writeSuccess) {
      res.status(201).json({ success: true, dossier: newDossier });
    } else {
      res.status(500).json({ success: false, error: 'Database write failure.' });
    }
  });

  // Delete a specific dossier
  app.delete('/api/dossiers/:id', (req, res) => {
    const { id } = req.params;
    let dossiers = readDossiers();
    const initialLength = dossiers.length;
    dossiers = dossiers.filter((d: any) => d.id !== id);

    if (dossiers.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Dossier not found.' });
    }

    const writeSuccess = writeDossiers(dossiers);
    if (writeSuccess) {
      res.json({ success: true, message: 'Dossier permanently purged from archives.' });
    } else {
      res.status(500).json({ success: false, error: 'Database write failure during deletion.' });
    }
  });

  // ───────────────── VITE OR STATIC SERVING ─────────────────

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aura Atelier Server] Operational and listening at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal server startup failure:', error);
});
