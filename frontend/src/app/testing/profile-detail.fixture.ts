import { ISkyblockProfileDetail } from '@shared/models/profile.model';

export const EMPTY_DETAIL: ISkyblockProfileDetail = {
  skyblock_xp: 8145,
  skyblock_level: 81,
  purse: 15024,
  bank: null,
  fairy_souls: 2,
  minions_crafted: 169,
  created_at: null,
  gear: {
    armor: [{ id: 'RANCHERS_BOOTS', name: "Bustling Rancher's Boots", count: 1, rarity: 'EPIC', lore: '§7Health: §c+175\n\n§5§lEPIC BOOTS', icon_id: 'RANCHERS_BOOTS' }],
    equipment: [],
  },
  accessories: { items: [], magical_power: 78, selected_power: 'Fortuitous', tuning: [] },
  pets: [{ name: '[Lvl 84] Bee', lore: '§7Level: §b84\n\n§5§lEPIC PET', icon_id: 'PET_BEE', type: 'Bee', tier: 'EPIC', level: 84, xp: 1, held_item: null, active: true }],
  inventory: { inventory: [], ender_chest: [], vault: [], potion_bag: [], quiver: [], sacks: [] },
  skills: [{ name: 'Mining', level: 38, xp: 1, cap: 60 }],
  dungeons: { catacombs_level: 9, catacombs_xp: 1, selected_class: 'Berserk', secrets: 131, classes: [], floors: [], master_floors: [] },
  slayer: [],
  minions: [],
  bestiary: { total_kills: 0, families: [] },
  collections: [],
  crimson_isle: [],
  rift: [],
  misc: [{ label: 'Deaths', value: 121 }],
};
