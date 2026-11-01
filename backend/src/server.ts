import express from 'express';
import { buildDetail } from './detail';
import type { IMojangProfile, ISkyblockProfileDetail, ISkyblockProfile } from '../../shared/models/profile.model';

const app = express();
const port = Number(process.env['PORT'] ?? 3000);
const hypixelKey = process.env['HYPIXEL_API_KEY'];

const USERNAME_PATTERN = /^[A-Za-z0-9_]{1,16}$/;
const UUID_PATTERN = /^[0-9a-f]{32}$/i;
const PROFILE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

app.get('/api/mojang/:username', async (req, res) => {
  const { username } = req.params;
  if (!USERNAME_PATTERN.test(username)) {
    res.status(400).json({ error: 'Invalid username' });
    return;
  }

  try {
    const response = await fetch(`https://api.minecraftservices.com/minecraft/profile/lookup/name/${username}`);
    if (response.status === 204 || response.status === 404) {
      res.status(404).json({ error: 'Username not found' });
      return;
    }
    if (!response.ok) {
      res.status(response.status === 429 ? 429 : 502).json({ error: 'Mojang lookup failed' });
      return;
    }
    const { id, name } = await response.json() as IMojangProfile;
    res.json({ id, name } satisfies IMojangProfile);
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: 'Mojang lookup failed' });
  }
});

app.get('/api/profiles/:uuid', async (req, res) => {
  const { uuid } = req.params;
  if (!UUID_PATTERN.test(uuid)) {
    res.status(400).json({ error: 'Invalid UUID' });
    return;
  }
  if (!hypixelKey) {
    res.status(500).json({ error: 'HYPIXEL_API_KEY is not configured' });
    return;
  }

  try {
    const response = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?uuid=${uuid}`, {
      headers: { 'API-Key': hypixelKey },
    });
    if (!response.ok) {
      res.status(response.status === 429 ? 429 : 502).json({ error: 'Hypixel lookup failed' });
      return;
    }
    const data = await response.json() as { profiles: any[] | null };
    const profiles: ISkyblockProfile[] = (data.profiles ?? []).map(p => ({
      profile_id: p.profile_id,
      cute_name: p.cute_name,
      game_mode: p.game_mode ?? 'classic',
      selected: !!p.selected,
    }));
    res.json(profiles);
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: 'Hypixel lookup failed' });
  }
});

app.get('/api/profile/:profileId', async (req, res) => {
  const { profileId } = req.params;
  const uuid = String(req.query['uuid'] ?? '');
  if (!PROFILE_ID_PATTERN.test(profileId) || !UUID_PATTERN.test(uuid)) {
    res.status(400).json({ error: 'Invalid profile id or UUID' });
    return;
  }
  if (!hypixelKey) {
    res.status(500).json({ error: 'HYPIXEL_API_KEY is not configured' });
    return;
  }

  try {
    const response = await fetch(`https://api.hypixel.net/v2/skyblock/profile?profile=${profileId}`, {
      headers: { 'API-Key': hypixelKey },
    });
    if (!response.ok) {
      res.status(response.status === 429 ? 429 : 502).json({ error: 'Hypixel lookup failed' });
      return;
    }
    const data = await response.json() as { profile: any | null };
    if (!data.profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json(await buildDetail(data.profile, uuid.toLowerCase()) satisfies ISkyblockProfileDetail);
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: 'Hypixel lookup failed' });
  }
});

const ICON_ID_PATTERN = /^[A-Za-z0-9_:.-]{1,80}$/;
const ICON_SOURCES = [
  (id: string) => `https://api.shiiyu.moe/api/item/${encodeURIComponent(id)}`,
  (id: string) => `https://sky.coflnet.com/static/icon/${encodeURIComponent(id)}`,
];
const iconCache = new Map<string, { type: string; body: Buffer } | null>();

// Icons are fetched server side so the browser doesn't depend on third-party hotlinking rules
app.get('/api/icon/:id', async (req, res) => {
  const { id } = req.params;
  if (!ICON_ID_PATTERN.test(id)) {
    res.status(400).json({ error: 'Invalid icon id' });
    return;
  }

  if (!iconCache.has(id)) {
    let icon: { type: string; body: Buffer } | null = null;
    const head = /^HEAD_([0-9a-f]{40,64})$/.exec(id)?.[1];
    for (const source of head ? [() => `https://api.shiiyu.moe/api/head/${head}`] : ICON_SOURCES) {
      try {
        const response = await fetch(source(id), { headers: { 'User-Agent': 'hypixel-auction-tracker' } });
        const type = response.headers.get('content-type') ?? '';
        if (response.ok && type.startsWith('image/')) {
          icon = { type, body: Buffer.from(await response.arrayBuffer()) };
          break;
        }
      } catch (e) {
        console.error(e);
      }
    }
    iconCache.set(id, icon);
  }

  const icon = iconCache.get(id);
  if (!icon) {
    res.status(404).json({ error: 'Icon not found' });
    return;
  }
  res.set({ 'Content-Type': icon.type, 'Cache-Control': 'public, max-age=86400' }).send(icon.body);
});

app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
