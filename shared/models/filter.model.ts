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

export const DEFAULT_FILTER: IFilter = {
    searchString: "",
    excludeString: "",
    searchArray: [],
    excludeArray: [],
    itemName: true,
    itemDescription: false,
    auctionType: "all",
    minBid: 0,
    maxBid: 0,
    category: "all",
    tier: "all",
};