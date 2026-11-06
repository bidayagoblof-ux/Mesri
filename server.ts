import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { db, User } from './server/db.ts';
import { handleVillageAssistantChat, handleGenerateHighQualityImage } from './server/gemini.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Middleware to extract authenticated user from Authorization header (Bearer <userId>)
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = db.getUserById(token);
    if (user) {
      (req as any).user = user;
    }
  }
  next();
}

app.use(authenticateUser);

// ----------------- API ROUTES ----------------- //

// 1. Auth routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { emailOrNik, password } = req.body;
  if (!emailOrNik || !password) {
    return res.status(400).json({ error: 'Email/NIK dan kata sandi wajib diisi.' });
  }

  const user = db.authenticate(emailOrNik, password);
  if (!user) {
    return res.status(401).json({ error: 'Email/NIK atau kata sandi tidak cocok, atau akun dinonaktifkan.' });
  }

  const { passwordHash, ...safeUser } = user;
  db.logAction(user.id, user.fullName, user.role, 'LOGIN', 'Masuk ke sistem');
  return res.json({
    token: user.id,
    user: safeUser
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { nik, email, password, fullName, phone, dusun, rtRw } = req.body;
  if (!nik || !email || !password || !fullName) {
    return res.status(400).json({ error: 'NIK, email, kata sandi, dan nama lengkap wajib diisi.' });
  }

  if (nik.length !== 16) {
    return res.status(400).json({ error: 'Format NIK harus 16 digit angka.' });
  }

  const result = db.registerUser({
    nik,
    email,
    passwordPlain: password,
    fullName,
    phone,
    dusun,
    rtRw
  });

  if (!result.success || !result.user) {
    return res.status(400).json({ error: result.error });
  }

  const { passwordHash, ...safeUser } = result.user;
  return res.json({
    token: result.user.id,
    user: safeUser
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Belum masuk ke sistem.' });
  }
  const { passwordHash, ...safeUser } = user;
  return res.json({ user: safeUser });
});

app.get('/api/users', (req: Request, res: Response) => {
  return res.json(db.listUsers());
});

// 2. Services routes
app.get('/api/services', (req: Request, res: Response) => {
  return res.json(db.listServices());
});

app.get('/api/services/:id', (req: Request, res: Response) => {
  const service = db.getServiceById(req.params.id);
  if (!service) return res.status(404).json({ error: 'Jenis layanan tidak ditemukan.' });
  return res.json(service);
});

app.post('/api/services', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user || user.role !== 'kades') {
    return res.status(403).json({ error: 'Hanya Administrator/Kepala Desa yang dapat menambah layanan.' });
  }
  const newService = db.createService(req.body);
  db.logAction(user.id, user.fullName, user.role, 'CREATE_SERVICE', `Membuat jenis layanan baru: ${newService.name}`);
  return res.status(201).json(newService);
});

app.put('/api/services/:id', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user || user.role !== 'kades') {
    return res.status(403).json({ error: 'Hanya Administrator/Kepala Desa yang dapat mengubah konfigurasi layanan.' });
  }
  const updated = db.updateService(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Layanan tidak ditemukan.' });
  db.logAction(user.id, user.fullName, user.role, 'UPDATE_SERVICE', `Memperbarui layanan: ${updated.name}`);
  return res.json(updated);
});

app.delete('/api/services/:id', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user || user.role !== 'kades') {
    return res.status(403).json({ error: 'Hanya Administrator yang berwenang menghapus layanan.' });
  }
  const success = db.deleteService(req.params.id);
  if (!success) return res.status(404).json({ error: 'Layanan tidak ditemukan.' });
  return res.json({ success: true });
});

// 3. Applications routes
app.get('/api/applications', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  const { status, serviceId, search, mine } = req.query;

  let userIdFilter: string | undefined = undefined;
  // If user is resident (masyarakat), strictly filter to their own applications
  if (user?.role === 'masyarakat' || mine === 'true') {
    if (!user) return res.status(401).json({ error: 'Silakan masuk terlebih dahulu.' });
    userIdFilter = user.id;
  }

  const applications = db.listApplications({
    userId: userIdFilter,
    status: status as string,
    serviceId: serviceId as string,
    search: search as string
  });
  return res.json(applications);
});

app.get('/api/applications/:id', (req: Request, res: Response) => {
  const appItem = db.getApplicationById(req.params.id);
  if (!appItem) return res.status(404).json({ error: 'Permohonan tidak ditemukan.' });

  const user = (req as any).user as User | undefined;
  // If resident, check ownership
  if (user && user.role === 'masyarakat' && appItem.applicantUserId !== user.id) {
    return res.status(403).json({ error: 'Anda tidak memiliki hak akses untuk permohonan ini.' });
  }

  return res.json(appItem);
});

app.post('/api/applications', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Silakan masuk ke akun Anda sebelum mengajukan layanan.' });
  }

  const { serviceId, purpose, customData, documents } = req.body;
  if (!serviceId || !purpose) {
    return res.status(400).json({ error: 'Jenis layanan dan tujuan permohonan wajib diisi.' });
  }

  const newApp = db.createApplication({
    serviceId,
    applicantUser: user,
    purpose,
    customData: customData || {},
    documents: documents || []
  });

  return res.status(201).json(newApp);
});

app.post('/api/applications/:id/status', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user || user.role === 'masyarakat') {
    return res.status(403).json({ error: 'Hanya perangkat desa berwenang yang dapat mengubah status permohonan.' });
  }

  const { status, notes } = req.body;
  if (!status) return res.status(400).json({ error: 'Status baru wajib disertakan.' });

  const updated = db.updateApplicationStatus(
    req.params.id,
    status,
    { id: user.id, name: user.fullName, role: user.role },
    notes
  );

  if (!updated) return res.status(404).json({ error: 'Permohonan tidak ditemukan.' });
  return res.json(updated);
});

app.post('/api/applications/:id/issue-letter', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user || (user.role !== 'kades' && user.role !== 'sekdes')) {
    return res.status(403).json({ error: 'Hanya Kepala Desa atau Sekretaris Desa yang berwenang menerbitkan surat resmi.' });
  }

  const { signatoryName, signatoryRole, customContent } = req.body;
  const letter = db.issueLetter({
    applicationId: req.params.id,
    signatoryName: signatoryName || user.fullName,
    signatoryRole: signatoryRole || (user.role === 'kades' ? 'Kepala Desa Lolosoni' : 'Sekretaris Desa a.n. Kepala Desa'),
    actor: { id: user.id, name: user.fullName, role: user.role },
    customContent
  });

  if (!letter) return res.status(404).json({ error: 'Gagal menerbitkan surat. Permohonan tidak ditemukan.' });
  return res.status(201).json(letter);
});

// 4. Letters & Archives routes
app.get('/api/letters', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  const letters = db.listLetters();
  if (user && user.role === 'masyarakat') {
    return res.json(letters.filter((l) => l.recipientNik === user.nik));
  }
  return res.json(letters);
});

app.get('/api/letters/:id', (req: Request, res: Response) => {
  const letter = db.getLetterById(req.params.id);
  if (!letter) return res.status(404).json({ error: 'Surat arsip tidak ditemukan.' });
  return res.json(letter);
});

// 5. Residents routes
app.get('/api/residents', (req: Request, res: Response) => {
  return res.json(db.listResidents());
});

app.get('/api/residents/:nik', (req: Request, res: Response) => {
  const resident = db.getResidentByNik(req.params.nik);
  if (!resident) return res.status(404).json({ error: 'Data penduduk tidak ditemukan.' });
  return res.json(resident);
});

app.post('/api/residents', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user || user.role === 'masyarakat') {
    return res.status(403).json({ error: 'Hanya perangkat desa yang dapat menambah data kependudukan.' });
  }
  const created = db.createResident(req.body);
  return res.status(201).json(created);
});

// 6. Statistics & Reports
app.get('/api/stats', (req: Request, res: Response) => {
  return res.json(db.getStats());
});

// 7. Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user) return res.json([]);
  return res.json(db.listNotifications(user.id));
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const success = db.markNotificationRead(req.params.id);
  return res.json({ success });
});

app.put('/api/notifications/read-all', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (user) {
    db.markAllNotificationsRead(user.id);
  }
  return res.json({ success: true });
});

// 8. Activity logs
app.get('/api/activity-logs', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user || user.role === 'masyarakat') {
    return res.status(403).json({ error: 'Akses terbatas untuk aparatur desa.' });
  }
  return res.json(db.listActivityLogs());
});

// 9. Village config
app.get('/api/village-config', (req: Request, res: Response) => {
  return res.json(db.getVillageConfig());
});

app.put('/api/village-config', (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user || user.role !== 'kades') {
    return res.status(403).json({ error: 'Hanya Kepala Desa yang berwenang mengubah profil desa.' });
  }
  const updated = db.updateVillageConfig(req.body);
  db.logAction(user.id, user.fullName, user.role, 'UPDATE_VILLAGE_CONFIG', 'Memperbarui profil / visi misi desa');
  return res.json(updated);
});

// 10. SQL Schema & PHP Project Files routes
app.get('/api/schema-sql', (req: Request, res: Response) => {
  try {
    const filePath = path.join(process.cwd(), 'php_project', 'database.sql');
    if (fs.existsSync(filePath)) {
      const sqlContent = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(sqlContent);
    }
    return res.status(404).send('SQL Schema file not found.');
  } catch (err) {
    return res.status(500).send('Error reading schema file.');
  }
});

// List all files in php_project
app.get('/api/php-project/files', (req: Request, res: Response) => {
  try {
    const baseDir = path.join(process.cwd(), 'php_project');
    const result: Array<{ path: string; name: string; size: number; category: string }> = [];

    function scanDir(dir: string, relativePrefix: string = '') {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          scanDir(fullPath, relPath);
        } else {
          const stat = fs.statSync(fullPath);
          let category = 'Core / View';
          if (relPath.startsWith('models/')) category = 'Model OOP';
          else if (relPath.startsWith('config/')) category = 'Database Config';
          else if (relPath.endsWith('.sql')) category = 'Database Schema';
          else if (relPath.startsWith('includes/')) category = 'Template Partials';
          else if (relPath.endsWith('.md')) category = 'Dokumentasi Skripsi';

          result.push({
            path: relPath,
            name: entry.name,
            size: stat.size,
            category
          });
        }
      }
    }

    scanDir(baseDir);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Gagal membaca direktori PHP.' });
  }
});

// Get content of a specific PHP project file
app.get('/api/php-project/file', (req: Request, res: Response) => {
  try {
    const filePathParam = req.query.path as string;
    if (!filePathParam) return res.status(400).json({ error: 'Parameter path wajib diisi.' });

    // Prevent directory traversal
    const safePath = path.normalize(filePathParam).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(process.cwd(), 'php_project', safePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File tidak ditemukan.' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    return res.json({
      path: safePath,
      name: path.basename(safePath),
      content
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Gagal membaca berkas.' });
  }
});

// Download all files as JSON bundle for client-side extraction/download
app.get('/api/php-project/bundle', (req: Request, res: Response) => {
  try {
    const baseDir = path.join(process.cwd(), 'php_project');
    const files: Record<string, string> = {};

    function readFiles(dir: string, relativePrefix: string = '') {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          readFiles(fullPath, relPath);
        } else {
          files[relPath] = fs.readFileSync(fullPath, 'utf-8');
        }
      }
    }

    readFiles(baseDir);
    return res.json({
      projectName: 'SIPADLO_PHP_MYSQL_OOP_Desa_Lolosoni',
      files
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Gagal membundel berkas PHP.' });
  }
});

// 11. Gemini AI endpoints
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { history, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Pesan wajib diisi.' });
    }
    const result = await handleVillageAssistantChat(history || [], message);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Gagal menghubungi asisten AI.' });
  }
});

app.post('/api/gemini/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio, imageSize } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt gambar wajib diisi.' });
    }
    const result = await handleGenerateHighQualityImage({
      prompt,
      aspectRatio,
      imageSize
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Gagal menghasilkan gambar.' });
  }
});

// Start server with Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIPADLO Desa Lolosoni server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
