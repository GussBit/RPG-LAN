import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { JSONFilePreset } from 'lowdb/node';
import os from 'os';

// --- CONFIGURAÇÃO INICIAL ---

// Tenta importar o sharp (opcional para otimizar imagens)
let sharp;
try { sharp = (await import('sharp')).default; } catch (e) { console.log('Sharp não encontrado. Usando modo fallback.'); }

// Configuração de caminhos e diretórios
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'images');
const audioDir = path.join(publicDir, 'audio');

const dataDir = path.join(__dirname, '../frontend/src/data');

// Garante que as pastas existem ao iniciar
[imagesDir, audioDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(publicDir));

// --- BANCO DE DADOS (JSON) ---
// Note: Removemos 'gallery' daqui, pois agora é lido do disco
const defaultData = { 
  scenes: [], 
  activeSceneId: null,
  presets: { mobs: [], players: [], ships: [] },
  customItems: []
};

const db = await JSONFilePreset('db.json', defaultData);

// Configuração de Upload (Memória para processamento)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ====================================================================
// --- SISTEMA DE ARQUIVOS (FILE SYSTEM SCAN) ---
// ====================================================================

/**
 * Lê uma pasta física e retorna os arquivos formatados para o Frontend.
 * Isso garante que o que está na pasta é o que aparece na tela.
 */
const scanDirectory = (dirPath, typeUrl, fileType) => {
  try {
    if (!fs.existsSync(dirPath)) return [];
    
    const files = fs.readdirSync(dirPath);
    
    return files
      .filter(file => !file.startsWith('.')) // Ignora arquivos ocultos do sistema
      .map(file => {
        // Cria um ID único baseado no nome (para o React key)
        const id = Buffer.from(file).toString('base64');
        const isAmbience = file.toLowerCase().includes('amb');
        
        return {
          id: id,
          name: file, // O nome real do arquivo
          url: `${typeUrl}/${file}`, // Ex: /images/foto.webp
          // Se for áudio, tenta definir o tipo (ambiente ou sfx)
          type: fileType === 'audio' ? (isAmbience ? 'ambiente' : 'sfx') : undefined
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Ordem alfabética
  } catch (err) {
    console.error(`Erro ao ler diretório ${dirPath}:`, err);
    return [];
  }
};

// 1. Rota de Listagem (Lê o disco em tempo real)
app.get('/api/gallery', (req, res) => {
  const images = scanDirectory(imagesDir, '/images', 'image');
  const audio = scanDirectory(audioDir, '/audio', 'audio');
  res.json({ images, audio });
});

// 2. Rota de Upload de Imagem (Salva no disco)
app.post('/api/upload/image', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

  try {
    // No início do bloco try:
    const dataInclusao = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const nomeOriginal = path.parse(req.file.originalname).name;
    const extension = sharp ? '.webp' : path.extname(req.file.originalname);
    
    // Nome final: NomeOriginal-11-05-2024.webp
    const fileName = `${nomeOriginal}-${dataInclusao}${extension}`;
    const filePath = path.join(imagesDir, fileName);

    // Salva o arquivo (com ou sem otimização)
    if (sharp) {
      await sharp(req.file.buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .toFormat('webp', { quality: 80 })
        .toFile(filePath);
    } else {
      fs.writeFileSync(filePath, req.file.buffer);
    }

    // Retorna o objeto do arquivo recém-criado
    res.json({ 
      name: fileName, 
      url: `/images/${fileName}` 
    });
  } catch (err) {
    console.error('Erro upload imagem:', err);
    res.status(500).json({ error: 'Falha ao salvar imagem' });
  }
});

// 3. Rota de Upload de Áudio (Salva no disco)
app.post('/api/upload/audio', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

  try {
    // --- LÓGICA DE RENOMEAÇÃO ---
    const dataInclusao = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-'); // Formato: DD-MM-AAAA
    const nomeOriginal = path.parse(req.file.originalname).name; // Pega o nome sem a extensão
    const extensao = path.extname(req.file.originalname); // Pega a extensão (.mp3, .wav)
    
    // Nome final: NomeOriginal-11-05-2024.mp3
    const fileName = `${nomeOriginal}-${dataInclusao}${extensao}`;
    const filePath = path.join(audioDir, fileName);
    // ----------------------------

    // Salva o arquivo no disco
    fs.writeFileSync(filePath, req.file.buffer);

    res.json({ 
      name: fileName, 
      url: `/audio/${fileName}`,
      type: fileName.toLowerCase().includes('amb') ? 'ambiente' : 'sfx'
    });
  } catch (err) {
    console.error('Erro upload audio:', err);
    res.status(500).json({ error: 'Falha ao salvar áudio' });
  }
});

// 4. Rota de Exclusão (Remove do disco)
app.delete('/api/gallery/:type/:fileName', (req, res) => {
  const { type, fileName } = req.params;
  
  // Segurança básica contra Directory Traversal
  if (fileName.includes('..') || fileName.includes('/')) {
    return res.status(400).json({ error: 'Nome de arquivo inválido' });
  }

  const folder = type === 'images' ? imagesDir : audioDir;
  const filePath = path.join(folder, fileName);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao deletar arquivo' });
    }
  } else {
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

// 5. Rotas para Edição de Dados (JSONs do Frontend)
app.get('/api/data-files', (req, res) => {
  try {
    if (!fs.existsSync(dataDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar arquivos de dados' });
  }
});

app.get('/api/data/:filename', (req, res) => {
  const { filename } = req.params;
  if (filename.includes('..') || !filename.endsWith('.json')) return res.status(400).json({ error: 'Arquivo inválido' });
  
  try {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado' });
    
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ler arquivo' });
  }
});

app.post('/api/data/:filename', (req, res) => {
  const { filename } = req.params;
  const content = req.body;
  
  if (filename.includes('..') || !filename.endsWith('.json')) return res.status(400).json({ error: 'Arquivo inválido' });

  try {
    const filePath = path.join(dataDir, filename);
    // Salva formatado com indentação de 2 espaços
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar arquivo' });
  }
});

// --- CUSTOM ITEMS (COMPÊNDIO) ---

app.get('/api/customItems', (req, res) => {
  res.json(db.data.customItems || []);
});

app.post('/api/customItems', async (req, res) => {
  const item = req.body;
  const newItem = { ...item, id: `item-${Date.now()}` };
  if (!db.data.customItems) db.data.customItems = [];
  db.data.customItems.push(newItem);
  await db.write();
  res.json(newItem);
});

app.delete('/api/customItems/:id', async (req, res) => {
  const { id } = req.params;
  if (!db.data.customItems) return res.status(404).json({ error: 'Item não encontrado' });
  db.data.customItems = db.data.customItems.filter(i => i.id !== id);
  await db.write();
  res.status(204).send();
});

// ====================================================================
// --- LÓGICA DO JOGO (DB.JSON) ---
// ====================================================================

// Helper para evitar crash se não houver cena ativa
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

// Estado Geral
app.get('/api/state', (req, res) => {
  ensureActiveSceneValid();
  res.json(db.data);
});

// ... (outras rotas de presets)

// Rota para ATUALIZAR um preset (PATCH)
app.patch('/api/presets/:type/:presetId', async (req, res) => {
  const { type, presetId } = req.params;
  const updates = req.body;
  
  // Verifica se o tipo existe (mobs, players, ships)
  if (!db.data.presets || !db.data.presets[type]) {
    return res.status(404).json({ error: 'Tipo de preset não encontrado' });
  }
  
  // Encontra o preset pelo ID
  const preset = db.data.presets[type].find(p => p.id === presetId);
  if (!preset) {
    return res.status(404).json({ error: 'Preset não encontrado' });
  }
  
  // Atualiza os dados e salva no banco
  Object.assign(preset, updates);
  await db.write();
  res.json(preset);
});

// ... (rota delete, etc)


// --- CENAS ---

app.post('/api/scenes', async (req, res) => {
  const { name } = req.body;
  const newScene = {
    id: `cena-${Date.now()}`,
    name: name || 'Nova Cena',
    background: '',
    mobs: [],
    players: [],
    ships: [],
    initiativeActive: false,
    playlist: []
  };
  db.data.scenes.push(newScene);
  db.data.activeSceneId = newScene.id;
  await db.write();
  res.json(newScene);
});

app.patch('/api/active-scene', async (req, res) => {
  const { activeSceneId } = req.body;
  db.data.activeSceneId = activeSceneId;
  await db.write();
  res.json({ success: true });
});

app.patch('/api/scenes/:id', async (req, res) => {
  const scene = db.data.scenes.find(s => s.id === req.params.id);
  if (scene) {
    if (req.body.name) scene.name = req.body.name;
    if (req.body.background !== undefined) scene.background = req.body.background;
    if (req.body.notes !== undefined) scene.notes = req.body.notes;
    if (req.body.images !== undefined) scene.images = req.body.images;
    if (req.body.initiativeActive !== undefined) scene.initiativeActive = req.body.initiativeActive;
    await db.write();
    res.json(scene);
  } else {
    res.status(404).json({ error: 'Cena não encontrada' });
  }
});

app.post('/api/scenes/:id/duplicate', async (req, res) => {
  const original = db.data.scenes.find(s => s.id === req.params.id);
  if (!original) return res.status(404).json({ error: 'Cena não encontrada' });

  const newScene = JSON.parse(JSON.stringify(original));
  newScene.id = `cena-${Date.now()}`;
  newScene.name = `${original.name} (cópia)`;
  
  // Regenera IDs internos para evitar duplicatas
  newScene.mobs = (newScene.mobs || []).map(m => ({ ...m, id: `mob-${Date.now()}-${Math.random().toString(16).slice(2)}` }));
  newScene.playlist = (newScene.playlist || []).map(t => ({ ...t, id: `track-${Date.now()}-${Math.random().toString(16).slice(2)}` }));
  newScene.ships = (newScene.ships || []).map(s => ({ ...s, id: `ship-${Date.now()}-${Math.random().toString(16).slice(2)}` }));

  db.data.scenes.push(newScene);
  db.data.activeSceneId = newScene.id;
  await db.write();
  res.json(newScene);
});

app.delete('/api/scenes/:id', async (req, res) => {
  const idx = db.data.scenes.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Cena não encontrada' });
  
  db.data.scenes.splice(idx, 1);
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
    initiative: Number(mob.initiative || 0),
    hiddenInInitiative: true, // Padrão: Oculto no tracker
    conditions: [],
    inventory: mob.inventory || [],
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

  // --- SYNC GLOBAL DE INVENTÁRIO PARA MOBS ---
  // Se o inventário foi alterado, propaga para o preset e para todos os outros mobs com o mesmo nome
  if (updates.inventory) {
    // 1. Atualiza o Preset (se existir)
    if (!db.data.presets) db.data.presets = { mobs: [], players: [] };
    if (!db.data.presets.mobs) db.data.presets.mobs = [];
    
    const preset = db.data.presets.mobs.find(p => p.name === mob.name);
    if (preset) {
      preset.inventory = updates.inventory;
    }

    // 2. Atualiza outras instâncias em todas as cenas
    db.data.scenes.forEach(s => {
      if (s.mobs) {
        s.mobs.forEach(m => {
          if (m.name === mob.name && m.id !== mobId) {
            m.inventory = updates.inventory;
          }
        });
      }
    });
  }

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

// --- PLAYERS ---

app.post('/api/scenes/:sceneId/players', async (req, res) => {
  const { sceneId } = req.params;
  const player = req.body;

  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  const token = Math.random().toString(36).substring(2, 15);
  
  // --- GLOBAL PRESET SYNC (LOAD) ---
  // Verifica se existe um preset global para carregar o estado atual (HP, Condições)
  if (!db.data.presets) db.data.presets = { mobs: [], players: [] };
  if (!db.data.presets.players) db.data.presets.players = [];

  const globalPreset = db.data.presets.players.find(p => p.characterName === player.characterName);
  
  // Se existir global, usa os dados dele. Se não, usa o que veio no request ou defaults.
  const baseData = {
    maxHp: globalPreset?.maxHp ?? Number(player.maxHp || 10),
    currentHp: globalPreset?.currentHp ?? Number(player.currentHp ?? player.maxHp ?? 10),
    conditions: globalPreset?.conditions ?? [],
    inventory: globalPreset?.inventory ?? [],
    photo: globalPreset?.photo || player.photo || '',
    playerName: globalPreset?.playerName || player.playerName || 'Jogador'
  };

  const newPlayer = {
    id: `player-${Date.now()}`,
    playerName: baseData.playerName,
    characterName: player.characterName || 'Personagem',
    photo: baseData.photo,
    maxHp: baseData.maxHp,
    currentHp: baseData.currentHp,
    accessUrl: `/p/${token}`,
    initiative: Number(player.initiative || 0),
    accessToken: token,
    conditions: baseData.conditions,
    inventory: baseData.inventory,
  };

  // Se não existia preset global, cria um agora
  if (!globalPreset && newPlayer.characterName) {
     db.data.presets.players.push({
       id: `preset-player-${Date.now()}`,
       characterName: newPlayer.characterName,
       playerName: newPlayer.playerName,
       maxHp: newPlayer.maxHp,
       currentHp: newPlayer.currentHp,
       conditions: newPlayer.conditions,
       inventory: newPlayer.inventory,
       photo: newPlayer.photo,
       createdAt: new Date().toISOString()
     });
  }

  scene.players = scene.players || [];
  scene.players.push(newPlayer);
  await db.write();
  res.status(201).json(newPlayer);
});

app.patch('/api/scenes/:sceneId/players/:playerId', async (req, res) => {
  const { sceneId, playerId } = req.params;
  const updates = req.body;
  const scene = db.data.scenes.find((s) => s.id === sceneId);

  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  const player = (scene.players || []).find((p) => p.id === playerId);
  if (!player) return res.status(404).json({ error: 'Jogador não encontrado' });

  Object.assign(player, updates);

  // --- GLOBAL PRESET SYNC (UPDATE) ---
  // Propaga mudanças para o Preset Global e para outras Cenas
  if (player.characterName) {
      if (!db.data.presets) db.data.presets = { mobs: [], players: [] };
      if (!db.data.presets.players) db.data.presets.players = [];

      // 1. Atualiza (ou cria) o Preset Global
      let globalPreset = db.data.presets.players.find(p => p.characterName === player.characterName);
      const globalState = {
          maxHp: player.maxHp,
          currentHp: player.currentHp,
          conditions: player.conditions,
          inventory: player.inventory,
          photo: player.photo,
          playerName: player.playerName
      };

      if (globalPreset) {
          Object.assign(globalPreset, globalState);
      } else {
          db.data.presets.players.push({
              id: `preset-player-${Date.now()}`,
              characterName: player.characterName,
              ...globalState,
              createdAt: new Date().toISOString()
          });
      }

      // 2. Sincroniza outras instâncias em outras cenas
      db.data.scenes.forEach(s => {
          if (s.players) {
              s.players.forEach(p => {
                  // Atualiza se for o mesmo personagem (nome igual) mas ID diferente
                  if (p.characterName === player.characterName && p.id !== playerId) {
                      Object.assign(p, globalState);
                  }
              });
          }
      });
  }

  await db.write();
  res.json(player);
});

app.delete('/api/scenes/:sceneId/players/:playerId', async (req, res) => {
  const { sceneId, playerId } = req.params;
  const scene = db.data.scenes.find((s) => s.id === sceneId);

  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  scene.players = (scene.players || []).filter((p) => p.id !== playerId);
  await db.write();
  res.status(204).send();
});

// --- SHIPS (BATALHA NAVAL) ---

app.post('/api/scenes/:sceneId/ships', async (req, res) => {
  const { sceneId } = req.params;
  const shipData = req.body;
  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  // Sincronização de Preset (Similar aos Players)
  if (!db.data.presets) db.data.presets = { mobs: [], players: [], ships: [] };
  if (!db.data.presets.ships) db.data.presets.ships = [];

  let globalPreset = null;
  // Tenta achar preset existente pelo nome
  globalPreset = db.data.presets.ships.find(s => s.name === shipData.name);

  const newShip = {
    id: `ship-${Date.now()}`,
    name: shipData.name,
    type: shipData.type || 'mob', // 'player' ou 'mob'
    maxHp: Number(globalPreset?.maxHp ?? shipData.maxHp ?? 100),
    currentHp: Number(globalPreset?.currentHp ?? shipData.currentHp ?? shipData.maxHp ?? 100),
    maxMorale: Number(globalPreset?.maxMorale ?? shipData.maxMorale ?? 10),
    currentMorale: Number(globalPreset?.currentMorale ?? shipData.currentMorale ?? shipData.maxMorale ?? 10),
    image: globalPreset?.image || shipData.image || '',
    conditions: globalPreset?.conditions || [],
    initiative: Number(shipData.initiative || 0),
    inventory: globalPreset?.inventory || shipData.inventory || [],
  };

  // Salva Preset automaticamente para todos os navios (se não existir)
  if (!globalPreset) {
      db.data.presets.ships.push({
          id: `preset-ship-${Date.now()}`,
          ...newShip,
          createdAt: new Date().toISOString()
      });
  }

  scene.ships = scene.ships || [];
  scene.ships.push(newShip);
  await db.write();
  res.status(201).json(newShip);
});

app.patch('/api/scenes/:sceneId/ships/:shipId', async (req, res) => {
  const { sceneId, shipId } = req.params;
  const updates = req.body;
  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  const ship = (scene.ships || []).find((s) => s.id === shipId);
  if (!ship) return res.status(404).json({ error: 'Navio não encontrado' });

  Object.assign(ship, updates);
  
  // Atualiza Preset correspondente
  if (db.data.presets?.ships) {
      const preset = db.data.presets.ships.find(p => p.name === ship.name);
      if (preset) Object.assign(preset, updates);
  }

  await db.write();
  res.json(ship);
});

app.delete('/api/scenes/:sceneId/ships/:shipId', async (req, res) => {
  const { sceneId, shipId } = req.params;
  const scene = db.data.scenes.find((s) => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  scene.ships = (scene.ships || []).filter((s) => s.id !== shipId);
  await db.write();
  res.status(204).send();
});

// Buscar Player por Token (Para a página pública do jogador)
app.get('/api/players/token/:token', (req, res) => {
  const { token } = req.params;
  
  for (const scene of db.data.scenes) {
    const player = (scene.players || []).find(p => p.accessToken === token);
    if (player) {
      return res.json({
        player,
        scene: {
          id: scene.id,
          name: scene.name,
          background: scene.background,
          initiativeActive: scene.initiativeActive,
          mobs: scene.mobs || [], // Adicionado: Envia os mobs
          players: scene.players || [], // Adicionado: Envia os outros jogadores
          ships: scene.ships || [] // Adicionado: Envia os navios para o jogador
        }
      });
    }
  }
  res.status(404).json({ error: 'Jogador não encontrado ou token inválido' });
});

// Sincronização leve (Players da cena ativa)
app.get('/api/sync/players/:sceneId', (req, res) => {
  const { sceneId } = req.params;
  const scene = db.data.scenes.find(s => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });
  res.json({ players: scene.players || [], mobs: scene.mobs || [], initiativeActive: scene.initiativeActive });
});


// --- PLAYLIST / TRACKS ---

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

app.delete('/api/scenes/:sceneId/playlist/:trackId', async (req, res) => {
  const { sceneId, trackId } = req.params;
  const scene = db.data.scenes.find(s => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  scene.playlist = scene.playlist.filter(t => t.id !== trackId);
  await db.write();
  res.status(204).send();
});

// --- PRESETS ---

app.get('/api/presets/:type', (req, res) => {
  const { type } = req.params; // 'mobs' ou 'players'
  if (!db.data.presets) db.data.presets = { mobs: [], players: [], ships: [] }; // Garante estrutura
  if (type === 'ships' && !db.data.presets.ships) db.data.presets.ships = []; // Garante array de navios
  res.json(db.data.presets[type] || []);
});

app.post('/api/presets/:type', async (req, res) => {
  const { type } = req.params;
  const preset = req.body;
  
  if (!db.data.presets) db.data.presets = { mobs: [], players: [], ships: [] };
  if (!db.data.presets[type]) db.data.presets[type] = [];
  
  // PADRONIZE O FORMATO DO ID
  const newPreset = {
    ...preset, // Mantém os dados enviados
    id: `preset-${type}-${Date.now()}`, // Ex: preset-mobs-1738516800000
    createdAt: new Date().toISOString()
  };
  
  db.data.presets[type].push(newPreset);
  await db.write();
  res.json(newPreset);
});

app.patch('/api/presets/:type/:presetId', async (req, res) => {
  const { type, presetId } = req.params;
  const updates = req.body;
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 [PATCH] Requisição recebida');
  console.log('📋 Type:', type);
  console.log('🆔 Preset ID:', presetId);
  console.log('📦 Updates:', updates);

  if (!db.data.presets || !db.data.presets[type]) {
    console.error(`❌ Tipo "${type}" não existe!`);
    return res.status(404).json({ error: 'Tipo de preset não encontrado' });
  }
  
  console.log('📋 Total de presets:', db.data.presets[type].length);
  console.log('🗂️ IDs disponíveis:', db.data.presets[type].map(p => p.id));

  // 🔥 BUSCA BIDIRECIONAL - funciona para ambos os formatos
  const preset = db.data.presets[type].find(p => {
    const match = (
      p.id === presetId ||                           // Exato
      p.id.includes(presetId) ||                     // Banco tem mais (preset-mobs-123 contém preset-123)
      presetId.includes(p.id) ||                     // ID enviado tem mais (preset-mobs-123 contém preset-123)
      p.id === `preset-${type}-${presetId}` ||       // Adiciona tipo
      p.id.endsWith(presetId) ||                     // Termina com
      p.id.replace('preset-', '') === presetId ||    // Remove prefixo
      p.id.replace(`preset-${type}-`, '') === presetId // Remove prefixo completo
    );
    
    if (match) {
      console.log(`✅ Match encontrado: "${p.id}" === "${presetId}"`);
    }
    
    return match;
  });

  if (!preset) {
    console.error(`❌ Preset "${presetId}" não encontrado!`);
    return res.status(404).json({ 
      error: 'Preset não encontrado',
      searchedFor: presetId,
      available: db.data.presets[type].map(p => p.id)
    });
  }
  
  console.log(`✅ Atualizando preset: ${preset.id}`);
  Object.assign(preset, updates);
  await db.write();
  console.log('💾 Salvo com sucesso!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  res.json(preset);
});

app.delete('/api/presets/:type/:presetId', async (req, res) => {
  const { type, presetId } = req.params;
  
  if (!db.data.presets || !db.data.presets[type]) {
    return res.status(404).json({ error: 'Preset não encontrado' });
  }
  
  db.data.presets[type] = db.data.presets[type].filter(p => p.id !== presetId);
  await db.write();
  res.status(204).send();
});

// --- INICIATIVA ---

app.post('/api/scenes/:sceneId/initiative/reset', async (req, res) => {
  const { sceneId } = req.params;
  const scene = db.data.scenes.find(s => s.id === sceneId);
  if (!scene) return res.status(404).json({ error: 'Cena não encontrada' });

  // Reseta iniciativas e ativa o modo de combate
  if (scene.mobs) scene.mobs.forEach(m => m.initiative = Math.floor(Math.random() * 20) + 1);
  if (scene.players) scene.players.forEach(p => p.initiative = 0);
  scene.initiativeActive = true;

  await db.write();
  res.json(scene);
});

// --- INICIALIZAÇÃO ---

const PORT = 3333;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend RPG rodando na porta ${PORT}`);
  console.log(`Sistema de Arquivos Ativo em: ${publicDir}`);
  
  // Mostra os IPs de rede disponíveis para facilitar a conexão
  const interfaces = os.networkInterfaces();
  Object.keys(interfaces).forEach((ifname) => {
    interfaces[ifname].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`📡 Acessível na rede em: http://${iface.address}:${PORT}`);
      }
    });
  });

  console.log(`[${new Date().toLocaleTimeString()}] Servidor pronto/reiniciado.`);
});