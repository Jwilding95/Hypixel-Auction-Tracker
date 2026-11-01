export interface IMojangProfile {
    id: string;
    name: string;
};

export interface ISkyblockSkill {
    name: string;
    level: number;
    xp: number;
    cap: number;
};

export interface ISkyblockItem {
    id: string;
    name: string;
    count: number;
    rarity: string | null;
    /** Raw lore with Minecraft colour codes, lines separated by "
" */
    lore: string;
    /** Item id used to look up the icon */
    icon_id: string;
};

export interface ISkyblockPet {
    name: string;
    type: string;
    lore: string;
    icon_id: string;
    tier: string;
    level: number;
    xp: number;
    held_item: string | null;
    active: boolean;
};

export interface ISkyblockLabelValue {
    label: string;
    value: string | number;
};

export interface ISkyblockDungeonFloor {
    floor: string;
    completions: number;
    times_played: number;
    best_score: number | null;
};

export interface ISkyblockDungeons {
    catacombs_level: number;
    catacombs_xp: number;
    selected_class: string | null;
    secrets: number;
    classes: { name: string; level: number; xp: number }[];
    floors: ISkyblockDungeonFloor[];
    master_floors: ISkyblockDungeonFloor[];
};

export interface ISkyblockSlayer {
    name: string;
    xp: number;
    level: number;
    kills: { tier: number; kills: number }[];
};

export interface ISkyblockMinion {
    name: string;
    lore: string;
    icon_id: string;
    highest_tier: number;
    tiers: number[];
};

export interface ISkyblockCount {
    name: string;
    lore: string;
    icon_id: string;
    count: number;
    tier?: number;
};

export interface ISkyblockProfileDetail {
    skyblock_xp: number;
    skyblock_level: number;
    purse: number;
    bank: number | null;
    fairy_souls: number;
    minions_crafted: number;
    created_at: number | null;
    gear: { armor: ISkyblockItem[]; equipment: ISkyblockItem[] };
    accessories: {
        items: ISkyblockItem[];
        magical_power: number;
        selected_power: string | null;
        tuning: ISkyblockLabelValue[];
    };
    pets: ISkyblockPet[];
    inventory: {
        inventory: ISkyblockItem[];
        ender_chest: ISkyblockItem[];
        vault: ISkyblockItem[];
        potion_bag: ISkyblockItem[];
        quiver: ISkyblockItem[];
        sacks: ISkyblockCount[];
    };
    skills: ISkyblockSkill[];
    dungeons: ISkyblockDungeons;
    slayer: ISkyblockSlayer[];
    minions: ISkyblockMinion[];
    bestiary: { total_kills: number; families: ISkyblockCount[] };
    collections: ISkyblockCount[];
    crimson_isle: ISkyblockLabelValue[];
    rift: ISkyblockLabelValue[];
    misc: ISkyblockLabelValue[];
};

export interface ISkyblockProfile {
    profile_id: string;
    cute_name: string;
    game_mode: string;
    selected: boolean;
};
