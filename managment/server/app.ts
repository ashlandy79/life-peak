import express, { type Request, type Response } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import {
  loadDatabase,
  saveDatabase,
  UPLOADS_DIR,
  DATA_DIR,
  type DatabaseSchema,
} from './db';
import { inspectImageFile } from './imageHelper';
import type {
  AssetRecord,
  AssetType,
  CardDefinition,
  CardTemplate,
  DigitalPackDefinition,
  FrameTemplate,
  TagLibraryItem,
} from '../src/core/lifepackTypes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态提供上传的图片资源
app.use('/uploads', express.static(UPLOADS_DIR));

// 配置 multer 接收上传图片
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 最大 30MB
});

// 健康检查
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ============================================================================
// 1. 基础元数据 (系列 / 分类 / IP 角色)
// ============================================================================
app.get('/api/meta', (_req: Request, res: Response) => {
  const db = loadDatabase();
  res.json({
    series: db.series,
    categories: db.categories,
    characters: db.characters,
  });
});

// ============================================================================
// 2. 素材库 (Assets)
// ============================================================================
app.get('/api/assets', (req: Request, res: Response) => {
  const db = loadDatabase();
  const { type } = req.query;
  let list = db.assets;
  if (type && typeof type === 'string') {
    list = list.filter((a) => a.assetType === type);
  }
  res.json(list);
});

// 上传单个文件并自动解析透明通道与尺寸
app.post(
  '/api/assets/upload',
  upload.single('file'),
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({ error: '未接收到上传文件' });
      return;
    }

    const filePath = req.file.path;
    const meta = inspectImageFile(filePath);
    const assetType = (req.body.assetType as AssetType) || 'OTHER';
    const customName = req.body.name || req.file.originalname;

    const record: AssetRecord = {
      id: `asset-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      name: customName,
      assetType,
      mimeType: meta.mimeType || req.file.mimetype,
      width: meta.width,
      height: meta.height,
      hasAlpha: meta.hasAlpha,
      fileSize: req.file.size,
      version: 1,
      sourceFileName: req.file.originalname,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      validationStatus: meta.hasAlpha || assetType === 'BACKGROUND' ? 'PASSED' : 'WARNING',
      validationMessages:
        !meta.hasAlpha && assetType === 'SUBJECT'
          ? ['主体未检测到透明 Alpha 通道，旋转时可能无法正常镂空']
          : [],
      storageKey: req.file.filename,
      url: `/uploads/${req.file.filename}`,
    };

    const db = loadDatabase();
    db.assets.unshift(record);
    saveDatabase(db);

    res.json(record);
  }
);

// 允许通过 Base64 DataURL 保存生成的预览图/缩略图
app.post('/api/assets/dataurl', (req: Request, res: Response): void => {
  const { dataUrl, name, assetType = 'PREVIEW' } = req.body;
  if (!dataUrl || typeof dataUrl !== 'string') {
    res.status(400).json({ error: '无效的 dataUrl' });
    return;
  }

  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    res.status(400).json({ error: 'DataURL 格式不合法' });
    return;
  }

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `preview-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.png`;
  const filePath = path.resolve(UPLOADS_DIR, filename);

  fs.writeFileSync(filePath, buffer);
  const meta = inspectImageFile(filePath);

  const record: AssetRecord = {
    id: `asset-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    name: name || filename,
    assetType,
    mimeType,
    width: meta.width,
    height: meta.height,
    hasAlpha: meta.hasAlpha,
    fileSize: buffer.length,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'PASSED',
    validationMessages: [],
    storageKey: filename,
    url: `/uploads/${filename}`,
  };

  const db = loadDatabase();
  db.assets.unshift(record);
  saveDatabase(db);

  res.json(record);
});

// 删除素材（附带卡片与卡包引用检查保护）
app.delete('/api/assets/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const db = loadDatabase();

  // 引用安全检查
  const referencingCards = db.cards.filter(
    (c) =>
      c.visual.backgroundAssetId === id ||
      c.visual.subjectAssetId === id ||
      c.visual.foregroundOccluderAssetId === id ||
      c.visual.foregroundAccentAssetId === id ||
      c.visual.compositePreviewAssetId === id
  );

  const referencingPacks = db.packs.filter(
    (p) =>
      p.packBaseAssetId === id ||
      p.packFrontArtworkAssetId === id ||
      p.packLogoAssetId === id ||
      p.frontCompositeAssetId === id
  );

  if (referencingCards.length > 0 || referencingPacks.length > 0) {
    res.status(400).json({
      error: '该素材正在被引用，无法删除',
      referencingCards: referencingCards.map((c) => ({ id: c.id, code: c.cardCode, title: c.title })),
      referencingPacks: referencingPacks.map((p) => ({ id: p.id, code: p.packCode, title: p.title })),
    });
    return;
  }

  const asset = db.assets.find((a) => a.id === id);
  if (asset && asset.storageKey) {
    const filePath = path.resolve(UPLOADS_DIR, asset.storageKey);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('删除文件失败:', err);
      }
    }
  }

  db.assets = db.assets.filter((a) => a.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

// ============================================================================
// 3. 卡片管理 (Cards)
// ============================================================================
app.get('/api/cards', (req: Request, res: Response) => {
  const db = loadDatabase();
  const { search, series, status } = req.query;
  let list = db.cards;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (c) =>
        c.cardCode.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.internalName.toLowerCase().includes(q) ||
        c.task.description.toLowerCase().includes(q)
    );
  }

  if (series && typeof series === 'string') {
    list = list.filter((c) => c.seriesId === series);
  }

  if (status && typeof status === 'string') {
    list = list.filter((c) => c.status === status);
  }

  res.json(list);
});

app.get('/api/cards/:id', (req: Request, res: Response): void => {
  const db = loadDatabase();
  const card = db.cards.find((c) => c.id === req.params.id);
  if (!card) {
    res.status(404).json({ error: '卡片不存在' });
    return;
  }
  res.json(card);
});

app.post('/api/cards', (req: Request, res: Response): void => {
  const db = loadDatabase();
  const newCard: CardDefinition = req.body;

  // 编号重复性检查
  if (db.cards.some((c) => c.cardCode.toLowerCase() === (newCard.cardCode || '').toLowerCase())) {
    res.status(400).json({ error: `卡片业务编号 ${newCard.cardCode} 已存在，请使用唯一编号` });
    return;
  }

  newCard.id = newCard.id || `card-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  newCard.version = 1;
  newCard.createdAt = new Date().toISOString();
  newCard.updatedAt = new Date().toISOString();

  db.cards.unshift(newCard);
  saveDatabase(db);
  res.json(newCard);
});

app.put('/api/cards/:id', (req: Request, res: Response): void => {
  const db = loadDatabase();
  const index = db.cards.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: '卡片不存在' });
    return;
  }

  const existing = db.cards[index];
  const updated: CardDefinition = {
    ...existing,
    ...req.body,
    id: existing.id,
    version: (existing.version || 1) + 1,
    updatedAt: new Date().toISOString(),
  };

  db.cards[index] = updated;
  saveDatabase(db);
  res.json(updated);
});

// 克隆卡片
app.post('/api/cards/:id/clone', (req: Request, res: Response): void => {
  const db = loadDatabase();
  const source = db.cards.find((c) => c.id === req.params.id);
  if (!source) {
    res.status(404).json({ error: '源卡片不存在' });
    return;
  }

  const newCode = `LP-${Date.now().toString().slice(-4)}`;
  const cloned: CardDefinition = {
    ...JSON.parse(JSON.stringify(source)),
    id: `card-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    cardCode: newCode,
    internalName: `${source.internalName} (副本)`,
    title: `${source.title} (副本)`,
    status: 'DRAFT',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.cards.unshift(cloned);
  saveDatabase(db);
  res.json(cloned);
});

app.delete('/api/cards/:id', (req: Request, res: Response): void => {
  const db = loadDatabase();
  db.cards = db.cards.filter((c) => c.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// ============================================================================
// 4. 数字卡包管理 (Packs)
// ============================================================================
app.get('/api/packs', (_req: Request, res: Response) => {
  const db = loadDatabase();
  res.json(db.packs);
});

app.get('/api/packs/:id', (req: Request, res: Response): void => {
  const db = loadDatabase();
  const pack = db.packs.find((p) => p.id === req.params.id);
  if (!pack) {
    res.status(404).json({ error: '卡包不存在' });
    return;
  }
  res.json(pack);
});

app.post('/api/packs', (req: Request, res: Response): void => {
  const db = loadDatabase();
  const newPack: DigitalPackDefinition = req.body;

  if (db.packs.some((p) => p.packCode.toLowerCase() === (newPack.packCode || '').toLowerCase())) {
    res.status(400).json({ error: `卡包业务编号 ${newPack.packCode} 已存在` });
    return;
  }

  newPack.id = newPack.id || `pack-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  newPack.version = 1;
  newPack.createdAt = new Date().toISOString();
  newPack.updatedAt = new Date().toISOString();

  db.packs.unshift(newPack);
  saveDatabase(db);
  res.json(newPack);
});

app.put('/api/packs/:id', (req: Request, res: Response): void => {
  const db = loadDatabase();
  const index = db.packs.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: '卡包不存在' });
    return;
  }

  const existing = db.packs[index];
  const updated: DigitalPackDefinition = {
    ...existing,
    ...req.body,
    id: existing.id,
    version: (existing.version || 1) + 1,
    updatedAt: new Date().toISOString(),
  };

  db.packs[index] = updated;
  saveDatabase(db);
  res.json(updated);
});

app.delete('/api/packs/:id', (req: Request, res: Response): void => {
  const db = loadDatabase();
  db.packs = db.packs.filter((p) => p.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// ============================================================================
// ============================================================================
// 5. 卡片模板与等级模组管理 (Card Templates)
// ============================================================================
const handleGetTemplates = (_req: Request, res: Response) => {
  const db = loadDatabase();
  res.json(db.frames);
};

const handleGetTemplate = (req: Request, res: Response): void => {
  const db = loadDatabase();
  const template = db.frames.find((f) => f.id === req.params.id);
  if (!template) {
    res.status(404).json({ error: '模板不存在' });
    return;
  }
  res.json(template);
};

const handleCreateTemplate = (req: Request, res: Response): void => {
  const db = loadDatabase();
  const newTemplate: CardTemplate = req.body;
  const code = (newTemplate.templateCode || newTemplate.frameCode || '').toLowerCase();

  if (db.frames.some((f) => ((f.templateCode || f.frameCode || '').toLowerCase() === code))) {
    res.status(400).json({ error: `卡片模板编号 ${code} 已存在` });
    return;
  }

  newTemplate.id = newTemplate.id || `tpl-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  newTemplate.templateCode = newTemplate.templateCode || newTemplate.frameCode || `TPL-${Date.now().toString().slice(-4)}`;
  newTemplate.frameCode = newTemplate.templateCode;
  newTemplate.version = 1;
  newTemplate.createdAt = new Date().toISOString();
  newTemplate.updatedAt = new Date().toISOString();

  db.frames.push(newTemplate);
  saveDatabase(db);
  res.json(newTemplate);
};

const handleUpdateTemplate = (req: Request, res: Response): void => {
  const db = loadDatabase();
  const index = db.frames.findIndex((f) => f.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: '模板不存在' });
    return;
  }

  const existing = db.frames[index];
  const updated: CardTemplate = {
    ...existing,
    ...req.body,
    id: existing.id,
    version: (existing.version || 1) + 1,
    updatedAt: new Date().toISOString(),
  };

  db.frames[index] = updated;
  saveDatabase(db);
  res.json(updated);
};

const handleDeleteTemplate = (req: Request, res: Response): void => {
  const db = loadDatabase();
  const referencedBy = db.cards.filter((c) => c.frameTemplateId === req.params.id);
  if (referencedBy.length > 0) {
    res.status(400).json({
      error: '该模板正在被以下卡片使用，无法直接删除，建议将其状态设为归档',
      referencedCards: referencedBy.map((c) => ({ id: c.id, code: c.cardCode, title: c.title })),
    });
    return;
  }

  db.frames = db.frames.filter((f) => f.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
};

// 路由挂载 (支持 /api/templates 与旧 /api/frames)
app.get('/api/templates', handleGetTemplates);
app.get('/api/templates/:id', handleGetTemplate);
app.post('/api/templates', handleCreateTemplate);
app.put('/api/templates/:id', handleUpdateTemplate);
app.delete('/api/templates/:id', handleDeleteTemplate);

app.get('/api/frames', handleGetTemplates);
app.get('/api/frames/:id', handleGetTemplate);
app.post('/api/frames', handleCreateTemplate);
app.put('/api/frames/:id', handleUpdateTemplate);
app.delete('/api/frames/:id', handleDeleteTemplate);

// ============================================================================
// 5.1 属性标签库 (Tag Library)
// ============================================================================
app.get('/api/tags', (_req: Request, res: Response) => {
  const db = loadDatabase();
  res.json(db.tags || []);
});

app.post('/api/tags', (req: Request, res: Response): void => {
  const db = loadDatabase();
  const newTag: TagLibraryItem = req.body;
  if (!newTag.label) {
    res.status(400).json({ error: '标签文本不能为空' });
    return;
  }

  newTag.id = newTag.id || `tag-${Date.now()}`;
  newTag.defaultStars = newTag.defaultStars || 3;
  db.tags = db.tags || [];
  db.tags.push(newTag);
  saveDatabase(db);
  res.json(newTag);
});

app.delete('/api/tags/:id', (req: Request, res: Response): void => {
  const db = loadDatabase();
  db.tags = (db.tags || []).filter((t) => t.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// ============================================================================
// 6. 项目全量导出与恢复 (Backup & Restore)
// ============================================================================
app.get('/api/backup/export', (_req: Request, res: Response) => {
  const db = loadDatabase();
  const backup = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    data: db,
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="lifepack-backup-${Date.now()}.json"`);
  res.json(backup);
});

app.post('/api/backup/import', (req: Request, res: Response): void => {
  const { data } = req.body;
  if (!data || !Array.isArray(data.cards)) {
    res.status(400).json({ error: '备份数据格式不正确' });
    return;
  }
  saveDatabase(data);
  res.json({ success: true, count: data.cards.length });
});

export default app;
