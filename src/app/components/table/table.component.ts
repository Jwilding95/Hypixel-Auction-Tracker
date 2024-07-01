import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { IAuctionItem } from '../../models/auction.model';
import { CommonModule } from '@angular/common';
import { AuctionsService } from '../../services/auctions.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MsToTimePipe } from '../../pipes/msToTime.pipe';
import { PaginatePipe } from '../../pipes/paginate.pipe';
import { IFilter } from '../../models/filter.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, MsToTimePipe, PaginatePipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnInit, OnDestroy {

  @ViewChild('table') table!: TemplateRef<any>;

  private _auctions: IAuctionItem[] = [];
  public filteredAuctions: IAuctionItem[] = [];
  
  public columns: string[] = ["Auction Type", "Item", "Current Bid", "Time Remaining"];
  public sortedColumn = { column: "", reverse: false };
  
  public pageNumber: number = 0;
  public itemsPerPage: number = 10;
  public pageSizeOptions: number[] = [10, 25, 50, 100];
  public pageStart: number = 0;
  public pageEnd: number = 0
  private _maxPages: number = 0;
  
  private _nowSubscription: Subscription = new Subscription();
  public now: number = Date.now();
  
  public itemCardTopBottom: boolean = false;
  
  public loading: boolean = true;
  public error: string = '';

  constructor (
    private auctionService: AuctionsService,
  ) {this._nowSubscription = interval(1000).subscribe(() => this.now += 1000)}

  ngOnInit(): void {
    this.auctionService.auctions$.subscribe(auctions => {
      this._auctions = auctions;
    });
    this.auctionService.filter$.subscribe(filterObject => {
      this.filteredAuctions = this._filteredItems(this._auctions, { ...filterObject });
      this.pageNumber = 0;
      this._maxPages = Math.ceil(this.filteredAuctions.length / this.itemsPerPage) - 1;
      this._updatePageStartEnd();
    });
    this.auctionService.error$.subscribe(error => {
      this.error = error;
    });
    this.auctionService.loading$.subscribe(loading => {
      this.loading = loading;
    })
  }

  /**
   * Transforms the auctions array by filtering on the filterObject properties
   * to return a filtered array of auction items. If there are no auction
   * items, returns an empty array. If the filter object includes a search
   * or exclude string; items are ordered by relevance (count of unique
   * search terms present in the string) descending
   * @param { IAuctionItem[] } auctions 
   * @param { IFilter } filterObject 
   * @returns { IAuctionItem[] }
   */
  private _filteredItems(auctions: IAuctionItem[], filterObject: IFilter): IAuctionItem[] { 
    auctions = auctions.filter(e => {
        return (e.bin && filterObject.auctionType == 'BIN' || !e.bin && filterObject.auctionType == 'Auction' || filterObject.auctionType == 'all')
        && (e.category == filterObject.category || filterObject.category == 'all')
        && (e.tier == filterObject.tier || filterObject.tier == 'all')
        && (Math.max(e.highest_bid_amount, e.starting_bid) >= filterObject.minBid || !filterObject.minBid)
        && (Math.max(e.highest_bid_amount, e.starting_bid) <= filterObject.maxBid || !filterObject.maxBid)
    });
    if (!auctions) return [];
    if (!filterObject.searchString && !filterObject.excludeString) return auctions;
    const filteredAndSortedAuctions = auctions.map(e => {
        let itemSearch = e.item_name
        if (filterObject.itemDescription === true) {
          itemSearch += ` ${e.item_lore}`
        }
        const count = filterObject.searchArray.reduce((acc: any, searchTerm: any) => {
            return itemSearch.toLowerCase().includes(searchTerm.toLowerCase()) 
            && !filterObject.excludeArray.some(excludedTerm => itemSearch.toLowerCase().includes(excludedTerm.toLowerCase()))
            ? acc + 1 : acc;
        }, 0);
        return { ...e, count };
    }).filter(e => e.count > 0).sort((a, b) => b.count - a.count);

    return filteredAndSortedAuctions;
}

  /**
   * Set the items per page and page start/end when page size is modified
   * @param { Event } event 
   */
  public onPageSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage = +selectElement.value;
    this._maxPages = Math.ceil(this.filteredAuctions.length / this.itemsPerPage) - 1;
    this._updatePageStartEnd();
  }

  /**
   * Set current page number
   * @param { Number } pageChange 
   */
  public onPageChange(pageChange: number): void {
    this.pageNumber = Math.max(Math.min(this.pageNumber + pageChange, this._maxPages), 0);
    this._updatePageStartEnd();
  }

  /**
   * update the page items start/end 
   */
  private _updatePageStartEnd(): void {
    this.pageStart = Math.min(this.pageNumber * this.itemsPerPage + 1, this.filteredAuctions.length);
    this.pageEnd = Math.min((this.pageNumber + 1) * this.itemsPerPage, this.filteredAuctions.length);
  }

  /**
   * Order the filtered auctions by the given column, alternating between 
   * ascending and descending
   * @param { string } column 
   */
  public onSortColumn(column: string): void {
    switch (column) {
      case "Auction Type":
        this.filteredAuctions.sort((a, b) => a.bin === b.bin ? 0 : a.bin ? 1 : -1);
        break;
      case "Item":
        this.filteredAuctions.sort((a, b) => a.item_name.localeCompare(b.item_name));
        break;
      case "Current Bid":
        this.filteredAuctions.sort((a, b) => Math.max(a.starting_bid, a.highest_bid_amount) - Math.max(b.starting_bid, b.highest_bid_amount));
        break;
      case "Time Remaining":
        this.filteredAuctions.sort((a, b) => a.end - b.end);
        break;
    }

    if (column === this.sortedColumn.column && !this.sortedColumn.reverse) {
      this.filteredAuctions.reverse();
      this.sortedColumn = {column: column, reverse: true};
    } else {
      this.sortedColumn = {column: column, reverse: false};
    }

    this.filteredAuctions = [...this.filteredAuctions]
  }

  /**
   * Align the info card by top or bottom depending if the mouse enters via
   * the upper or lower half of the screen, respectively
   * @param { MouseEvent } event 
   */
  public setItemCardTopBottom(event: MouseEvent): void {
    this.itemCardTopBottom = event.clientY > window.innerHeight / 2
  }

  /**
   * Transforms an item's lore text to replace minecraft's color/format codes
   * with a respective css class, inserting the item's name to the start,
   * and wrapping each element in a span
   * @param { string } name - Name of the item
   * @param { string } lore - Lore of the item
   * @returns { string } - A string of span elements, joined by a separator of
   * "<br>""
   */
  public transformLore(name: string, lore: string): string {
    const codeRegex = /§.{1}/g
    const colorCodePositiveLookaheadRegex = /(?=§[0-9a-f])/g

    const lines = lore.split("\n");
    const tierCode = lines[lines.length - 1].match(/(?<=§)[0-9a-f]/) || "f";
    const formattedName = `<span class="item-card-${tierCode}">${name}</span>`
    const formattedLines = lines.map(line => {
      return line.split(colorCodePositiveLookaheadRegex).map(linePart => {
        const mappedCodes = linePart.match(codeRegex)?.map(code => `item-card-${code[1]}`) || [];
        const text = linePart.replace(codeRegex, "");
        return `<span${mappedCodes ? ` class="${mappedCodes.join(" ")}"`: ""}>${text}</span>`
        }).join("")
    }).join("<br>");

    return [formattedName, formattedLines].join("<br>")
  }

  ngOnDestroy() {
    this._nowSubscription.unsubscribe();
  }
}
