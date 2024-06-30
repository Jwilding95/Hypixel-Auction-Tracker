export interface IFilter {
    [key: string]: string | string[] | number | boolean;
    searchString: string,
    excludeString: string,
    searchArray: string[],
    excludeArray: string[]
    itemName: boolean,
    itemDescription: boolean,
    auctionType: string,
    minBid: number,
    maxBid: number,
    category: string,
    tier: string,
}