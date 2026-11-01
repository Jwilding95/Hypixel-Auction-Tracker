# Backend

Small Express proxy used by the frontend's recommendation-system page. Mojang does not allow browser (CORS) requests and the Hypixel profiles endpoint needs an API key, so both calls go through here.

## Run

```
cd backend
npm install
cp .env.example .env   # then set HYPIXEL_API_KEY
npm run dev
```

## Endpoints

- `GET /api/mojang/:username` returns `{ id, name }` (404 if the username does not exist)
- `GET /api/profiles/:uuid` returns the player's SkyBlock profiles as `ISkyblockProfile[]`
- `GET /api/profile/:profileId?uuid=<player uuid>` fetches `skyblock/profile?profile=` and returns an `ISkyblockProfileDetail` (summary stats plus the Gear, Accessories, Pets, Inventory, Skills, Dungeons, Slayer, Minions, Bestiary, Collections, Crimson Isle, Rift and Misc sections). Inventory NBT blobs are decoded server-side with `prismarine-nbt`.

## Bestiary mob heads

`src/bestiary-heads.ts` maps bestiary mob keys to head textures (served via `/api/icon/HEAD_<hash>` from api.shiiyu.moe). Regenerate it from SkyCrypt's data with `node scripts/gen-bestiary-heads.mjs`.
