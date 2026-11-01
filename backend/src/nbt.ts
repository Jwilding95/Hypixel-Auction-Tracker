import nbt from 'prismarine-nbt';
import type { ISkyblockItem } from '../../shared/models/profile.model';

const COLOUR_CODES = /§./g;
const RARITIES = ['VERY SPECIAL', 'SPECIAL', 'ULTIMATE', 'MYTHIC', 'LEGENDARY', 'EPIC', 'RARE', 'UNCOMMON', 'COMMON', 'DIVINE'];

export const stripColours = (s: string): string => s.replace(COLOUR_CODES, '').trim();

function rarityFromLore(lore: string[]): string | null {
  const last = [...lore].reverse().map(stripColours).find(l => l.length > 0) ?? '';
  return RARITIES.find(r => last.startsWith(r)) ?? null;
}

/**
 * Decodes a Hypixel `{ type, data }` base64 gzip NBT inventory blob into items.
 * Empty slots are skipped.
 */
export async function decodeInventory(blob: { data?: string } | undefined): Promise<ISkyblockItem[]> {
  if (!blob?.data) {
    return [];
  }
  try {
    const { parsed } = await nbt.parse(Buffer.from(blob.data, 'base64'));
    const slots = (nbt.simplify(parsed) as { i?: any[] }).i ?? [];
    return slots
      .filter(item => item && item.tag)
      .map((item): ISkyblockItem => {
        const lore: string[] = item.tag.display?.Lore ?? [];
        return {
          id: item.tag.ExtraAttributes?.id ?? '',
          name: stripColours(item.tag.display?.Name ?? ''),
          count: item.Count ?? 1,
          rarity: rarityFromLore(lore),
          lore: lore.join('\n'),
          icon_id: item.tag.ExtraAttributes?.id ?? '',
        };
      });
  } catch (e) {
    console.error('Failed to decode inventory', e);
    return [];
  }
}
