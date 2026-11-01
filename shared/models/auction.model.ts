export interface IAuctionItem {
    uuid: string,
    bin: boolean,
    category: string,
    end: number,
    highest_bid_amount: number,
    item_name: string,
    item_lore: string,
    starting_bid: number,
    tier: string
}

/**
 * Shape of a single auction object as returned by the Hypixel
 * /v2/skyblock/auctions API endpoint.
 */
export interface IRawAuction {
    auctioneer: string,
    bids: unknown[],
    bin: boolean,
    category: string,
    claimed: boolean,
    claimed_bidders: unknown[],
    coop: string[],
    end: number,
    extra: string,
    highest_bid_amount: number,
    item_bytes: string,
    item_lore: string,
    item_name: string,
    item_uuid: string,
    last_updated: number,
    profile_id: string,
    start: number,
    starting_bid: number,
    tier: string,
    uuid: string
}