import type {
  ISkyblockCount, ISkyblockDungeonFloor, ISkyblockLabelValue, ISkyblockProfileDetail, ISkyblockSkill,
} from '../../shared/models/profile.model';
import { BESTIARY_HEADS } from './bestiary-heads';
import { decodeInventory } from './nbt';
import { DUNGEON_LEVEL_XP, levelFromTable, PET_LEVEL_XP, PET_RARITY_OFFSET, SKILL_LEVEL_XP } from './tables';

const SKILLS: { key: string; name: string; cap: number }[] = [
  { key: 'SKILL_COMBAT', name: 'Combat', cap: 60 },
  { key: 'SKILL_MINING', name: 'Mining', cap: 60 },
  { key: 'SKILL_FARMING', name: 'Farming', cap: 60 },
  { key: 'SKILL_FORAGING', name: 'Foraging', cap: 54 },
  { key: 'SKILL_FISHING', name: 'Fishing', cap: 50 },
  { key: 'SKILL_ENCHANTING', name: 'Enchanting', cap: 60 },
  { key: 'SKILL_ALCHEMY', name: 'Alchemy', cap: 50 },
  { key: 'SKILL_TAMING', name: 'Taming', cap: 60 },
  { key: 'SKILL_CARPENTRY', name: 'Carpentry', cap: 50 },
  { key: 'SKILL_RUNECRAFTING', name: 'Runecrafting', cap: 25 },
  { key: 'SKILL_SOCIAL', name: 'Social', cap: 25 },
  { key: 'SKILL_HUNTING', name: 'Hunting', cap: 25 },
];

const FLOOR_NAMES = ['Entrance', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Floor 6', 'Floor 7'];
const MASTER_FLOOR_NAMES = ['', ...FLOOR_NAMES.slice(1).map(f => `Master ${f}`)];

const fmt = (n: number): string => Math.round(n).toLocaleString('en-US');

// Minecraft colour code of each item tier
const TIER_COLOURS: Record<string, string> = {
  COMMON: 'f', UNCOMMON: 'a', RARE: '9', EPIC: '5', LEGENDARY: '6', MYTHIC: 'd',
};

/** `SOME_ID` / `some_id` -> `Some Id` */
export const titleCase = (s: string): string =>
  s.toLowerCase().replace(/_/g, ' ').replace(/(^|\s)\S/g, c => c.toUpperCase());

/** Numeric leaves of a nested object as label/value pairs, e.g. { a: { b: 2 } } -> "A B": 2 */
export function flattenNumbers(obj: any, prefix = '', depth = 3): ISkyblockLabelValue[] {
  if (!obj || typeof obj !== 'object' || depth < 0) {
    return [];
  }
  return Object.entries(obj).flatMap(([key, value]): ISkyblockLabelValue[] => {
    const label = prefix ? `${prefix} ${titleCase(key)}` : titleCase(key);
    if (typeof value === 'number') {
      return [{ label, value }];
    }
    return flattenNumbers(value, label, depth - 1);
  });
}

function buildFloors(dungeon: any, names: string[]): ISkyblockDungeonFloor[] {
  const completions = dungeon?.tier_completions ?? {};
  const played = dungeon?.times_played ?? {};
  return names.flatMap((floor, i) => {
    if (!completions[i] && !played[i]) {
      return [];
    }
    const best = dungeon?.best_score?.[i];
    return [{
      floor,
      completions: completions[i] ?? 0,
      times_played: played[i] ?? 0,
      best_score: typeof best === 'number' ? best : null,
    }];
  });
}

function buildDungeons(member: any): ISkyblockProfileDetail['dungeons'] {
  const d = member.dungeons ?? {};
  const cataXp = d.dungeon_types?.catacombs?.experience ?? 0;
  return {
    catacombs_level: levelFromTable(cataXp, DUNGEON_LEVEL_XP, 50),
    catacombs_xp: cataXp,
    selected_class: d.selected_dungeon_class ? titleCase(d.selected_dungeon_class) : null,
    secrets: d.secrets ?? 0,
    classes: Object.entries<any>(d.player_classes ?? {}).map(([name, c]) => ({
      name: titleCase(name),
      level: levelFromTable(c?.experience ?? 0, DUNGEON_LEVEL_XP, 50),
      xp: c?.experience ?? 0,
    })),
    floors: buildFloors(d.dungeon_types?.catacombs, FLOOR_NAMES),
    master_floors: buildFloors(d.dungeon_types?.master_catacombs, MASTER_FLOOR_NAMES),
  };
}

function buildSlayer(member: any): ISkyblockProfileDetail['slayer'] {
  return Object.entries<any>(member.slayer?.slayer_bosses ?? {}).map(([name, boss]) => {
    const claimed = Object.keys(boss?.claimed_levels ?? {})
      .map(k => Number(k.replace('level_', '').replace(/_special$/, '')))
      .filter(n => !Number.isNaN(n));
    const kills = Object.entries<number>(boss ?? {})
      .flatMap(([k, v]) => {
        const m = /^boss_kills_tier_(\d+)$/.exec(k);
        return m ? [{ tier: Number(m[1]) + 1, kills: v }] : [];
      })
      .sort((a, b) => a.tier - b.tier);
    return { name: titleCase(name), xp: boss?.xp ?? 0, level: claimed.length ? Math.max(...claimed) : 0, kills };
  });
}

function buildMinions(member: any): ISkyblockProfileDetail['minions'] {
  const byName = new Map<string, number[]>();
  for (const id of member.player_data?.crafted_generators ?? []) {
    const idx = String(id).lastIndexOf('_');
    const tier = Number(String(id).slice(idx + 1));
    if (idx < 0 || Number.isNaN(tier)) {
      continue;
    }
    const name = String(id).slice(0, idx);
    byName.set(name, [...(byName.get(name) ?? []), tier]);
  }
  return [...byName.entries()]
    .map(([name, tiers]) => {
      const sorted = tiers.sort((a, b) => a - b);
      const highest = sorted[sorted.length - 1];
      return {
        name: titleCase(name),
        lore: `§7Highest tier: §e${highest}
§7Tiers crafted: §a${sorted.length}

§f§lMINION`,
        icon_id: `${name}_GENERATOR_${highest}`,
        highest_tier: highest,
        tiers: sorted,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Keywords (matched against a family's words, last word wins) to the vanilla mob whose spawn egg stands in as its icon
const MOB_EGGS: Record<string, string> = {
  zombie: 'ZOMBIE', undead: 'ZOMBIE', villager: 'ZOMBIE_VILLAGER', pigman: 'ZOMBIFIED_PIGLIN',
  skeleton: 'SKELETON', wither: 'WITHER_SKELETON', spider: 'SPIDER', enderman: 'ENDERMAN',
  endermite: 'ENDERMITE', silverfish: 'SILVERFISH', creeper: 'CREEPER', slime: 'SLIME', sludge: 'SLIME',
  wolf: 'WOLF', bat: 'BAT', cow: 'COW', pig: 'PIG', chicken: 'CHICKEN', sheep: 'SHEEP', rabbit: 'RABBIT',
  lynx: 'OCELOT', golem: 'IRON_GOLEM', guy: 'ZOMBIE', grunt: 'ZOMBIE', lurker: 'ZOMBIE', tank: 'ZOMBIE',
  souleater: 'ZOMBIE', dreadlord: 'SKELETON', goblin: 'ZOMBIE', walker: 'ZOMBIE', wraith: 'ZOMBIE',
  watcher: 'ZOMBIE', adventurer: 'ZOMBIE', hoarder: 'ZOMBIE', assassin: 'ZOMBIE', hunter: 'ZOMBIE',
  sentry: 'ZOMBIE', keeper: 'SPIDER', worm: 'SILVERFISH', scatha: 'SILVERFISH', rat: 'SILVERFISH',
  mouse: 'SILVERFISH', jerry: 'VILLAGER', melee: 'ZOMBIE', bow: 'SKELETON',
};

function mobIconId(family: string): string {
  const word = family.split('_').reverse().find(w => w in MOB_EGGS);
  return word ? `${MOB_EGGS[word]}_SPAWN_EGG` : '';
}

const FAMILY_HEADS = new Map<string, string>();
for (const [key, hash] of Object.entries(BESTIARY_HEADS)) {
  FAMILY_HEADS.set(key.replace(/_\d+$/, ''), `HEAD_${hash}`);
}

/** A "farming_" family (e.g. farming_pig) shares its head with the plain mob (pig), and vice versa */
function familyHead(family: string): string | undefined {
  return FAMILY_HEADS.get(family)
    ?? FAMILY_HEADS.get(family.startsWith('farming_') ? family.slice('farming_'.length) : `farming_${family}`);
}

function buildBestiary(member: any): ISkyblockProfileDetail['bestiary'] {
  const families = new Map<string, number>();
  const heads = new Map<string, string>();
  let total = 0;
  for (const [key, kills] of Object.entries<any>(member.bestiary?.kills ?? {})) {
    if (typeof kills !== 'number') {
      continue;
    }
    const family = key.replace(/_\d+$/, '');
    if (!heads.has(family) && BESTIARY_HEADS[key]) {
      heads.set(family, `HEAD_${BESTIARY_HEADS[key]}`);
    }
    families.set(family, (families.get(family) ?? 0) + kills);
    total += kills;
  }
  return {
    total_kills: total,
    families: [...families.entries()]
      .map(([name, count]) => ({
        name: titleCase(name),
        icon_id: heads.get(name) ?? familyHead(name) ?? mobIconId(name),
        lore: `§7Kills: §a${fmt(count)}

§c§lBESTIARY`,
        count,
      }))
      .sort((a, b) => b.count - a.count),
  };
}

function buildCollections(member: any): ISkyblockCount[] {
  const tiers = new Map<string, number>();
  for (const entry of member.player_data?.unlocked_coll_tiers ?? []) {
    const idx = String(entry).lastIndexOf('_');
    const tier = Number(String(entry).slice(idx + 1));
    if (idx >= 0 && !Number.isNaN(tier)) {
      const id = String(entry).slice(0, idx);
      tiers.set(id, Math.max(tiers.get(id) ?? 0, tier));
    }
  }
  return Object.entries<any>(member.collection ?? {})
    .map(([id, count]) => ({
      name: titleCase(id.replace(/:/g, ' ')),
      lore: `§7Collected: §a${fmt(Number(count))}
§7Tier: §e${tiers.get(id) ?? 0}

§e§lCOLLECTION`,
      icon_id: id.split(':')[0],
      count: Number(count),
      tier: tiers.get(id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function buildPets(member: any): ISkyblockProfileDetail['pets'] {
  return (member.pets_data?.pets ?? [])
    .map((p: any) => {
      const tier = String(p.tier ?? 'COMMON');
      const level = levelFromTable(p.exp ?? 0, PET_LEVEL_XP, 100, PET_RARITY_OFFSET[tier] ?? 0);
      const type = titleCase(String(p.type ?? ''));
      const held = p.heldItem ? titleCase(String(p.heldItem)) : null;
      const lines = [
        `§7Level: §b${level}`,
        `§7XP: §e${fmt(p.exp ?? 0)}`,
        ...(held ? [`§7Held item: §f${held}`] : []),
        ...(p.active ? ['§aActive'] : []),
        '',
        `§${TIER_COLOURS[tier] ?? 'f'}§l${tier} PET`,
      ];
      return {
        name: `[Lvl ${level}] ${type}`,
        type,
        lore: lines.join('\n'),
        icon_id: `PET_${String(p.type ?? '')}`,
        tier,
        level,
        xp: p.exp ?? 0,
        held_item: held,
        active: !!p.active,
      };
    })
    .sort((a: any, b: any) => Number(b.active) - Number(a.active) || b.xp - a.xp);
}

function buildMisc(profile: any, member: any): ISkyblockLabelValue[] {
  const stats = member.player_stats ?? {};
  const medals = member.jacobs_contest?.medals_inv ?? {};
  return [
    { label: 'Fairy Souls', value: member.fairy_soul?.total_collected ?? 0 },
    { label: 'Deaths', value: member.player_data?.death_count ?? 0 },
    { label: 'Total Kills', value: stats.kills?.total ?? 0 },
    { label: 'Highest Damage', value: Math.round(stats.highest_damage ?? 0) },
    { label: 'Highest Critical Damage', value: Math.round(stats.highest_critical_damage ?? 0) },
    { label: 'Pet XP Gained', value: Math.round(stats.pets?.total_exp_gained ?? 0) },
    { label: 'Mithril Powder', value: member.mining_core?.powder_mithril ?? 0 },
    { label: 'Gemstone Powder', value: member.mining_core?.powder_gemstone ?? 0 },
    { label: 'Glacite Powder', value: member.mining_core?.powder_glacite ?? 0 },
    { label: 'Garden Copper', value: member.garden_player_data?.copper ?? 0 },
    { label: 'Jacob Medals', value: `${medals.gold ?? 0} gold / ${medals.silver ?? 0} silver / ${medals.bronze ?? 0} bronze` },
    { label: 'Shards Owned', value: member.shards?.owned?.length ?? 0 },
    { label: 'Visited Zones', value: member.player_data?.visited_zones?.length ?? 0 },
    { label: 'Profile Members', value: Object.keys(profile?.members ?? {}).length },
  ];
}

/** Builds the tabbed detail for one player's member data within a raw Hypixel profile */
export async function buildDetail(profile: any, uuid: string): Promise<ISkyblockProfileDetail> {
  const member = profile?.members?.[uuid] ?? {};
  const inv = member.inventory ?? {};
  const experience = member.player_data?.experience ?? {};
  const tuning = member.accessory_bag_storage?.tuning ?? {};
  const activeSlot = tuning['slot_0'] ?? {};
  const nether = member.nether_island_player_data ?? {};

  const [armor, equipment, inventory, enderChest, vault, potionBag, quiver, talismans] = await Promise.all([
    decodeInventory(inv.inv_armor),
    decodeInventory(inv.equipment_contents),
    decodeInventory(inv.inv_contents),
    decodeInventory(inv.ender_chest_contents),
    decodeInventory(inv.personal_vault_contents),
    decodeInventory(inv.bag_contents?.potion_bag),
    decodeInventory(inv.bag_contents?.quiver),
    decodeInventory(inv.bag_contents?.talisman_bag),
  ]);

  const skills: ISkyblockSkill[] = SKILLS.map(({ key, name, cap }) => {
    const xp = experience[key] ?? 0;
    return { name, level: levelFromTable(xp, SKILL_LEVEL_XP, cap), xp, cap };
  });

  return {
    skyblock_xp: member.leveling?.experience ?? 0,
    skyblock_level: Math.floor((member.leveling?.experience ?? 0) / 100),
    purse: member.currencies?.coin_purse ?? 0,
    bank: profile?.banking?.balance ?? null,
    fairy_souls: member.fairy_soul?.total_collected ?? 0,
    minions_crafted: member.player_data?.crafted_generators?.length ?? 0,
    created_at: profile?.created_at ?? null,
    gear: { armor, equipment },
    accessories: {
      items: talismans,
      magical_power: member.accessory_bag_storage?.highest_magical_power ?? 0,
      selected_power: member.accessory_bag_storage?.selected_power ? titleCase(member.accessory_bag_storage.selected_power) : null,
      tuning: flattenNumbers(activeSlot, '', 0).filter(r => (r.value as number) > 0),
    },
    pets: buildPets(member),
    inventory: {
      inventory,
      ender_chest: enderChest,
      vault,
      potion_bag: potionBag,
      quiver,
      sacks: Object.entries<any>(inv.sacks_counts ?? {})
        .filter(([, count]) => count > 0)
        .map(([id, count]) => ({
          name: titleCase(id),
          lore: `§7Stored: §a${fmt(Number(count))}

§f§lSACK`,
          icon_id: id,
          count: Number(count),
        }))
        .sort((a, b) => b.count - a.count),
    },
    skills,
    dungeons: buildDungeons(member),
    slayer: buildSlayer(member),
    minions: buildMinions(member),
    bestiary: buildBestiary(member),
    collections: buildCollections(member),
    crimson_isle: [
      ...(nether.selected_faction ? [{ label: 'Faction', value: titleCase(nether.selected_faction) }] : []),
      ...flattenNumbers(nether.kuudra_completed_tiers, 'Kuudra Completed Tier'),
      ...flattenNumbers(nether.dojo, 'Dojo'),
      ...flattenNumbers(nether.matriarch, 'Matriarch'),
    ],
    rift: [
      ...flattenNumbers(member.rift?.access, 'Access').filter(r => !/timestamp/i.test(r.label)),
      ...Object.entries<any>(member.rift ?? {})
        .filter(([key, v]) => key !== 'access' && v && typeof v === 'object' && Object.keys(v).length > 0)
        .map(([key, v]) => ({ label: titleCase(key), value: `${Object.keys(v).length} entries` })),
    ],
    misc: buildMisc(profile, member),
  };
}
