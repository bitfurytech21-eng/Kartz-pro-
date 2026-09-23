import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { requireAuth, optionalAuth, requireAdmin, isEmailAdmin, AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreateUser,
  getUserSavedProperties,
  addSavedProperty,
  removeSavedProperty,
  createInquiryRecord,
  createSearchAlertRecord,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiryRecord,
  getAllSearchAlerts,
  getAllUsers,
  getAdminMetrics,
} from './src/db/users.ts';
import { getLocalAmenities } from './src/services/amenitiesService.ts';
import { buildFallbackAmenitiesResponse } from './src/data/curatedAmenities.ts';

// In AI Studio environment, reverse proxy requires port 3000.
// On Render, Render sets RENDER=true or RENDER_SERVICE_ID and supplies PORT.
const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
const PORT =
  isRender && process.env.PORT
    ? parseInt(process.env.PORT, 10) || 10000
    : 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Serve static assets from public folder directly (for images, icons, etc.)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Family photo upload and management endpoint
  app.post('/api/upload-family-photo', async (req, res) => {
    try {
      const { filename, data } = req.body;
      if (!filename || !data) {
        return res.status(400).json({ error: 'Missing filename or image data' });
      }

      // Sanitize filename to avoid path traversal
      const safeFilename = path.basename(filename);
      const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(data, 'base64');

      const publicDir = path.join(process.cwd(), 'public');
      const familyDir = path.join(publicDir, 'images', 'family');
      await fs.promises.mkdir(familyDir, { recursive: true });

      // Save to both root public and images/family
      await fs.promises.writeFile(path.join(publicDir, safeFilename), buffer);
      await fs.promises.writeFile(path.join(familyDir, safeFilename), buffer);

      // If dist exists, also copy there for production
      const distDir = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distDir)) {
        await fs.promises.writeFile(path.join(distDir, safeFilename), buffer).catch(() => {});
        const distFamilyDir = path.join(distDir, 'images', 'family');
        await fs.promises.mkdir(distFamilyDir, { recursive: true }).catch(() => {});
        await fs.promises.writeFile(path.join(distFamilyDir, safeFilename), buffer).catch(() => {});
      }

      res.json({ success: true, filename: safeFilename, url: `/${safeFilename}` });
    } catch (err: any) {
      console.error('Failed to save family photo:', err);
      res.status(500).json({ error: err.message || 'Failed to save photo' });
    }
  });

  // Query which real family photos exist on the server
  app.get('/api/family-photos', async (req, res) => {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const familyDir = path.join(publicDir, 'images', 'family');
      const ownersDir = path.join(publicDir, 'images', 'owners');

      const [rootFiles, familyFiles, ownerFiles] = await Promise.all([
        fs.promises.readdir(publicDir).catch(() => []),
        fs.promises.readdir(familyDir).catch(() => []),
        fs.promises.readdir(ownersDir).catch(() => []),
      ]);

      const allFiles = Array.from(new Set([...rootFiles, ...familyFiles, ...ownerFiles]));
      const photoFiles = allFiles.filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f));
      res.json({ photos: photoFiles });
    } catch (err: any) {
      res.json({ photos: [] });
    }
  });

  // Owner photo upload and management endpoint
  app.post('/api/upload-owner-photo', async (req, res) => {
    try {
      const { propertyRef, ownerName, filename, data } = req.body;
      if (!filename || !data) {
        return res.status(400).json({ error: 'Missing filename or image data' });
      }

      // Sanitize filename to avoid path traversal
      const ext = path.extname(filename) || '.jpeg';
      const cleanRef = (propertyRef || 'general').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeFilename = `owner_${cleanRef}_${Date.now()}${ext}`;

      const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(data, 'base64');

      const publicDir = path.join(process.cwd(), 'public');
      const ownersDir = path.join(publicDir, 'images', 'owners');
      await fs.promises.mkdir(ownersDir, { recursive: true });

      // Save file into public/images/owners and public/
      const targetPath = path.join(ownersDir, safeFilename);
      await fs.promises.writeFile(targetPath, buffer);
      await fs.promises.writeFile(path.join(publicDir, safeFilename), buffer);

      // If dist exists, also copy there for production
      const distDir = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distDir)) {
        const distOwnersDir = path.join(distDir, 'images', 'owners');
        await fs.promises.mkdir(distOwnersDir, { recursive: true }).catch(() => {});
        await fs.promises.writeFile(path.join(distOwnersDir, safeFilename), buffer).catch(() => {});
        await fs.promises.writeFile(path.join(distDir, safeFilename), buffer).catch(() => {});
      }

      // Update owners-map.json
      const mapPath = path.join(ownersDir, 'owners-map.json');
      let ownersMap: Record<string, string> = {};
      try {
        if (fs.existsSync(mapPath)) {
          ownersMap = JSON.parse(await fs.promises.readFile(mapPath, 'utf8'));
        }
      } catch {}

      const publicUrl = `/images/owners/${safeFilename}`;
      if (propertyRef) ownersMap[propertyRef] = publicUrl;
      if (ownerName) ownersMap[ownerName] = publicUrl;

      await fs.promises.writeFile(mapPath, JSON.stringify(ownersMap, null, 2));

      res.json({ success: true, filename: safeFilename, url: publicUrl, map: ownersMap });
    } catch (err: any) {
      console.error('Failed to save owner photo:', err);
      res.status(500).json({ error: err.message || 'Failed to save owner photo' });
    }
  });

  // Query property owners photos
  app.get('/api/owner-photos', async (req, res) => {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const ownersDir = path.join(publicDir, 'images', 'owners');
      const mapPath = path.join(ownersDir, 'owners-map.json');

      let ownersMap: Record<string, string> = {};
      if (fs.existsSync(mapPath)) {
        try {
          ownersMap = JSON.parse(await fs.promises.readFile(mapPath, 'utf8'));
        } catch {}
      }

      res.json({ photos: ownersMap });
    } catch (err: any) {
      res.json({ photos: {} });
    }
  });

  app.get('/api/owners/photos', (req, res) => {
    res.redirect('/api/owner-photos');
  });

  // Delete an owner photo
  app.delete('/api/owner-photo', async (req, res) => {
    try {
      const { propertyRef, ownerName } = req.body;
      const publicDir = path.join(process.cwd(), 'public');
      const ownersDir = path.join(publicDir, 'images', 'owners');
      const mapPath = path.join(ownersDir, 'owners-map.json');

      if (fs.existsSync(mapPath)) {
        const ownersMap = JSON.parse(await fs.promises.readFile(mapPath, 'utf8'));
        if (propertyRef) delete ownersMap[propertyRef];
        if (ownerName) delete ownersMap[ownerName];
        await fs.promises.writeFile(mapPath, JSON.stringify(ownersMap, null, 2));
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete photo' });
    }
  });

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'cloudsql', timestamp: new Date().toISOString() });
  });

  // Direct Privacy Policy & Terms of Service endpoints for OAuth verification
  app.get('/privacy', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'privacy.html'));
  });
  app.get('/privacy.html', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'privacy.html'));
  });
  app.get('/terms', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'terms.html'));
  });
  app.get('/terms.html', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'terms.html'));
  });
  app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'robots.txt'));
  });
  app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'sitemap.xml'));
  });

  // User auth synchronization: upsert user into Cloud SQL
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email;
      if (!uid || !email) {
        return res.status(400).json({ error: 'Missing UID or email in token' });
      }

      const { name, photoUrl } = req.body || {};
      const user = await getOrCreateUser(uid, email, name, photoUrl);
      const saved = await getUserSavedProperties(uid);

      res.json({ user, savedProperties: saved });
    } catch (error: any) {
      console.error('Failed to sync user with database:', error);
      res.status(500).json({ error: error.message || 'Database synchronization failed' });
    }
  });

  // Get user's saved properties
  app.get('/api/favorites', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Unauthorized' });

      const saved = await getUserSavedProperties(uid);
      res.json({ savedProperties: saved });
    } catch (error: any) {
      console.error('Failed to fetch saved properties:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch favorites' });
    }
  });

  // Add a saved property
  app.post('/api/favorites', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const { propertyId } = req.body;
      if (!uid) return res.status(401).json({ error: 'Unauthorized' });
      if (!propertyId) return res.status(400).json({ error: 'Missing propertyId' });

      await addSavedProperty(uid, propertyId);
      res.json({ success: true, propertyId });
    } catch (error: any) {
      console.error('Failed to add favorite:', error);
      res.status(500).json({ error: error.message || 'Failed to save property' });
    }
  });

  // Remove a saved property
  app.delete('/api/favorites/:propertyId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const { propertyId } = req.params;
      if (!uid) return res.status(401).json({ error: 'Unauthorized' });
      if (!propertyId) return res.status(400).json({ error: 'Missing propertyId' });

      await removeSavedProperty(uid, propertyId);
      res.json({ success: true, propertyId });
    } catch (error: any) {
      console.error('Failed to remove favorite:', error);
      res.status(500).json({ error: error.message || 'Failed to delete favorite' });
    }
  });

  // Submit property or customer support inquiry
  app.post('/api/inquiries', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { propertyRef, propertyTitle, senderName, senderEmail, senderPhone, message } = req.body;
      if (!senderName || !senderEmail || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
      }

      const inquiry = await createInquiryRecord({
        userUid: req.user?.uid,
        propertyRef: propertyRef || 'CUSTOMER-SUPPORT',
        propertyTitle: propertyTitle || 'Customer Support & Concierge Inquiry',
        senderName,
        senderEmail,
        senderPhone,
        message,
      });

      res.json({ success: true, inquiry });
    } catch (error: any) {
      console.error('Failed to save inquiry:', error);
      res.status(500).json({ error: error.message || 'Failed to submit inquiry' });
    }
  });

  // Submit search alert
  app.post('/api/alerts', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { email, destination, propertyType, budgetMax } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required for alert creation' });
      }

      const alertRecord = await createSearchAlertRecord({
        userUid: req.user?.uid,
        email,
        destination,
        propertyType,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
      });

      res.json({ success: true, alert: alertRecord });
    } catch (error: any) {
      console.error('Failed to create search alert:', error);
      res.status(500).json({ error: error.message || 'Failed to create alert' });
    }
  });

  // Google Search-grounded Local Amenities for properties
  app.get('/api/amenities', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const location = (req.query.location as string) || '';
    const city = (req.query.city as string) || '';
    const title = (req.query.title as string) || '';

    try {
      const amenitiesData = await getLocalAmenities(location || city || 'Paris', city || location || 'Paris', title);
      res.json(amenitiesData);
    } catch {
      const fallback = buildFallbackAmenitiesResponse(location || city || 'Paris', city || location || 'Paris');
      res.json(fallback);
    }
  });

  app.post('/api/amenities', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { location, city, title } = req.body || {};

    try {
      const amenitiesData = await getLocalAmenities(location || city || 'Paris', city || location || 'Paris', title);
      res.json(amenitiesData);
    } catch {
      const fallback = buildFallbackAmenitiesResponse(location || city || 'Paris', city || location || 'Paris');
      res.json(fallback);
    }
  });

  // ---------------------------------------------------------------------------
  // Administrator Endpoints (Protected by requireAuth and requireAdmin)
  // ---------------------------------------------------------------------------

  // Verify current user admin role
  app.get('/api/admin/verify', requireAuth, (req: AuthRequest, res) => {
    const email = req.user?.email;
    const isAdmin = isEmailAdmin(email);
    res.json({
      isAdmin,
      email,
      uid: req.user?.uid,
    });
  });

  // Admin Dashboard summary metrics
  app.get('/api/admin/metrics', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const metrics = await getAdminMetrics();
      res.json({ metrics });
    } catch (error: any) {
      console.error('Failed to retrieve admin metrics:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve metrics' });
    }
  });

  // List all client inquiries
  app.get('/api/admin/inquiries', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const list = await getAllInquiries();
      res.json({ inquiries: list });
    } catch (error: any) {
      console.error('Failed to retrieve inquiries:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve inquiries' });
    }
  });

  // Update status of an inquiry (e.g. pending -> contacted -> viewing_scheduled -> closed)
  app.patch('/api/admin/inquiries/:id/status', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      if (isNaN(id) || !status) {
        return res.status(400).json({ error: 'Valid inquiry ID and status are required' });
      }

      const updated = await updateInquiryStatus(id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Inquiry not found' });
      }

      res.json({ success: true, inquiry: updated });
    } catch (error: any) {
      console.error('Failed to update inquiry status:', error);
      res.status(500).json({ error: error.message || 'Failed to update inquiry status' });
    }
  });

  // Delete an inquiry
  app.delete('/api/admin/inquiries/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Valid inquiry ID is required' });
      }

      await deleteInquiryRecord(id);
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Failed to delete inquiry:', error);
      res.status(500).json({ error: error.message || 'Failed to delete inquiry' });
    }
  });

  // List all registered search alerts
  app.get('/api/admin/alerts', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const list = await getAllSearchAlerts();
      res.json({ alerts: list });
    } catch (error: any) {
      console.error('Failed to retrieve search alerts:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve alerts' });
    }
  });

  // Text translation endpoint using Gemini with in-memory caching
  const serverTranslationCache = new Map<string, string>();

  app.post('/api/translate', async (req, res) => {
    try {
      const { text, targetLang, sourceLang = 'auto' } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Valid text is required for translation' });
      }

      const langNames: Record<string, string> = {
        EN: 'English',
        FR: 'French',
        ES: 'Spanish',
        PT: 'Portuguese',
        DE: 'German',
        IT: 'Italian',
        RU: 'Russian',
        ZH: 'Simplified Chinese',
        AR: 'Arabic',
        JA: 'Japanese',
        NL: 'Dutch',
        SV: 'Swedish',
        KO: 'Korean',
        TR: 'Turkish',
        PL: 'Polish',
        EL: 'Greek',
        HI: 'Hindi',
        HE: 'Hebrew',
        DA: 'Danish',
        NO: 'Norwegian',
        FI: 'Finnish',
        CS: 'Czech',
        TH: 'Thai',
        VI: 'Vietnamese',
      };
      const targetLanguageName = langNames[targetLang] || targetLang || 'English';

      const cacheKey = `${targetLang}:${text.slice(0, 80)}:${text.length}`;
      if (serverTranslationCache.has(cacheKey)) {
        return res.json({ translatedText: serverTranslationCache.get(cacheKey) });
      }

      if (process.env.GEMINI_API_KEY) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `You are a professional luxury real estate translator for Kretz Real Estate.
Translate the following real estate description into refined, elegant ${targetLanguageName}, preserving the luxury tone, property specifications, measurements (m² / hectares), room counts, and architectural details.
Do not add meta-commentary, conversational greetings, or notes. Output only the translated text.

Source text:
"""
${text}
"""`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          });

          const translated = response.text ? response.text.trim() : text;
          serverTranslationCache.set(cacheKey, translated);
          return res.json({ translatedText: translated });
        } catch (apiErr: any) {
          // If Gemini quota (429) or high demand (503) occurs, gracefully return original text
          serverTranslationCache.set(cacheKey, text);
          return res.json({ translatedText: text });
        }
      } else {
        return res.json({ translatedText: text });
      }
    } catch (err: any) {
      return res.json({ translatedText: req.body?.text || '' });
    }
  });

  // List all registered users
  app.get('/api/admin/users', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const list = await getAllUsers();
      res.json({ users: list });
    } catch (error: any) {
      console.error('Failed to retrieve users:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve users' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
