import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { JSONFilePreset } from 'lowdb/node';
// Tenta importar o sharp, se falhar usa fallback
let sharp;
try { sharp = (await import('sharp')).default; } catch (e) {}

// Configuração de caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Pastas estáticas
const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'images');
const audioDir = path.join(publicDir, 'audio');

[imagesDir, audioDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Banco de Dados
const defaultData = {
  scenes: [],
  activeSceneId: null,
};
const db = await JSONFilePreset('db.json', defaultData);

// Upload (memória)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- ROTAS DE UPLOAD ---

// Upload de imagem (Com redimensionamento se Sharp existir)
app.post('/api/upload/image', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo inválido' });
  const fileName = `img-${Date.now()}.webp`;
  const filePath = path.join(imagesDir, fileName);
  
  try {
    if (sharp) {
        await sharp(req.file.buffer)
          .resize(1200, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(filePath);
    } else {
        fs.writeFileSync(filePath, req.file.buffer);
    }
    res.json({ url: `/images/${fileName}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar imagem' });
  }
});

// Upload de Áudio
app.post('/api/upload/audio', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo inválido' });
  
  // Sanitizar nome original para usar no display
  const safeName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
  const ext = path.extname(req.file.originalname);
  const fileName = `audio-${Date.now()}${ext}`;
  
  fs.writeFileSync(path.join(audioDir, fileName), req.file.buffer);
  
  res.json({ url: `/audio/${fileName}`, name: safeName });
});

// Serve arquivos estáticos (Isso já lida com Audio Streaming/Seeking nativamente)
app.use(express.static(publicDir));

// --- API DO JOGO ---

// Helper para garantir integridade
const ensureActiveSceneValid = () => {
  const scenes = db.data.scenes || [];
  if (scenes.length === 0) {
    db.data.activeSceneId = null;
    return;
  }
  const exists = scenes.some((s) => s.id === db.data.activeSceneId);
  if (!exists) {
    db.data.activeSceneId = scenes[0].id;
  }
};

app.get('/api/state', (req, res) => {
  ensureActiveSceneValid();
  res.json(db.data);
});

// Criar Cena
app.post('/api/scenes', async (req, res) => {
  const { name } = req.body;
  const newScene = {
    id: `cena-${Date.now()}`,
    name: name || 'Nova Cena',
    background: '',
    mobs: [],
    playlist: []
  };
  db.data.scenes.push(newScene);
  db.data.activeSceneId = newScene.id; // Já ativa ela
  await db.write();
  res.json(newScene);
});

// Trocar Cena Ativa
app.patch('/api/active-scene', async (req, res) => {
  const { activeSceneId } = req.body;
  db.data.activeSceneId = activeSceneId;
  await db.write();
  res.json({ success: true });
});

// Renomear Cena
app.patch('/api/scenes/:id', async (req, res) => {
  const scene = db.data.scenes.find(s => s.id === req.params.id);
  if (scene) {
    scene.name = req.body.name;
    await db.write();
    res.json(scene);
  } else {
    res.status(404).json({ error: 'Cena não encontrada' });
  }
});

// Duplicar Cena (Clona profundamente mobs e playlist gerando novos IDs)
app.post('/api/scenes/:id/duplicate', async (req, res) => {
  const original = db.data.scenes.find(s => s.id === req.params.id);
  if (!original) return res.status(404).json({ error: 'Cena não encontrada' });

  const newScene = JSON.parse(JSON.stringify(original));
  newScene.id = `cena-${Date.now()}`;
  newScene.name = `${original.name} (cópia)`;
  
  // Gera novos IDs para os mobs e tracks para não bugar a key do React
  newScene.mobs = (newScene.mobs || []).map(m => ({ 
    ...m, 
    id: `mob-${Date.now()}-${Math.random().toString(16).slice(2)}` 
  }));
  
  newScene.playlist = (newScene.playlist || []).map(t => ({ 
    ...t, 
    id: `track-${Date.now()}-${Math.random().toString(16).slice(2)}` 
  }));

  db.data.scenes.push(newScene);
  db.data.activeSceneId = newScene.id;
  await db.write();
  res.json(newScene);
});

// Excluir Cena
app.delete('/api/scenes/:id', async (req, res) => {
  const idx = db.data.scenes.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Cena não encontrada' });
  
  db.data.scenes.splice(idx, 1);
  // Se apagou a ativa, reseta
  if (db.data.activeSceneId === req.params.id) {
     db.data.activeSceneId = db.data.scenes[0]?.id || null;
  }
  await db.write();
  res.json({ success: true });
});

// --- MOBS ---

app.post('/api/scenes/:sceneId/mobs', async (req, res) => {
  const { sceneId } = req.params;
  const mob = req.body;
  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  const newMob = {
    id: `mob-${Date.now()}`,
    name: mob.name,
    color: mob.color || 'red',
    maxHp: Number(mob.maxHp),
    currentHp: Number(mob.currentHp ?? mob.maxHp),
    damageDice: mob.damageDice || '1d6',
    toHit: Number(mob.toHit ?? 0),
    image: mob.image || '',
  };

  scene.mobs = scene.mobs || [];
  scene.mobs.push(newMob);
  await db.write();
  res.status(201).json(newMob);
});

app.patch('/api/scenes/:sceneId/mobs/:mobId', async (req, res) => {
  const { sceneId, mobId } = req.params;
  const updates = req.body;
  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  const mob = scene.mobs.find((m) => m.id === mobId);
  if (!mob) return res.status(404).json({ error: 'Mob não encontrado' });

  Object.assign(mob, updates);
  await db.write();
  res.json(mob);
});

app.delete('/api/scenes/:sceneId/mobs/:mobId', async (req, res) => {
  const { sceneId, mobId } = req.params;
  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  scene.mobs = scene.mobs.filter((m) => m.id !== mobId);
  await db.write();
  res.status(204).send();
});

// --- PLAYLIST / TRACKS (Atualizado para o Mixer Novo) ---

// Adicionar Track
app.post('/api/scenes/:sceneId/playlist', async (req, res) => {
  const { sceneId } = req.params;
  const track = req.body;
  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  scene.playlist = scene.playlist || [];
  scene.playlist.push(track);
  await db.write();
  res.json(scene.playlist);
});

// Atualizar Track (Volume, Tipo, Nome)
app.patch('/api/scenes/:sceneId/playlist/:trackId', async (req, res) => {
  const { sceneId, trackId } = req.params;
  const updates = req.body;
  
  const scene = db.data.scenes.find(s => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  const track = scene.playlist.find(t => t.id === trackId);
  if (!track) return res.status(404).json({ error: 'Faixa não encontrada' });

  Object.assign(track, updates);
  await db.write();
  res.json(track);
});

// Remover Track
app.delete('/api/scenes/:sceneId/playlist/:trackId', async (req, res) => {
  const { sceneId, trackId } = req.params;
  
  const scene = db.data.scenes.find(s => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  scene.playlist = scene.playlist.filter(t => t.id !== trackId);
  await db.write();
  res.status(204).send();
});

const PORT = 3333;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend RPG rodando na porta ${PORT}`);
});