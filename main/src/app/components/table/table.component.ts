import { Component, ViewEncapsulation, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IAuctionItem } from '../../models/auction.model';
import { CommonModule } from '@angular/common';
import { AuctionsService } from '../../services/auctions/auctions.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MsToTimePipe } from '../../pipes/msToTime.pipe';
import { PaginatePipe } from '../../pipes/paginate.pipe';
import { LoreTransformPipe } from '../../pipes/loreTransform.pipe';
import { IFilter } from '../../models/filter.model';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClickableDirective } from '../../directives/clickable.directive';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, MsToTimePipe, PaginatePipe, LoreTransformPipe, ClickableDirective],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent {

  private auctionService = inject(AuctionsService);

  public columns: string[] = ["Auction Type", "Item", "Current Bid", "Time Remaining"];
  public sortedColumn = signal<{ column: string; reverse: boolean }>({ column: "", reverse: false });

  public pageNumber = signal(0);
  public itemsPerPage = signal(10);
  public pageSizeOptions: number[] = [10, 25, 50, 100];

  public filteredAuctions = computed(() => {
    const filtered = this._filteredItems(this.auctionService.auctions(), this.auctionService.filter());
    return this._sortAuctions(filtered, this.sortedColumn());
  });

  public maxPages = computed(() => Math.ceil(this.filteredAuctions().length / this.itemsPerPage()) - 1);
  public pageStart = computed(() => Math.min(this.pageNumber() * this.itemsPerPage() + 1, this.filteredAuctions().length));
  public pageEnd = computed(() => Math.min((this.pageNumber() + 1) * this.itemsPerPage(), this.filteredAuctions().length));

  /**
   * Builds the list of page numbers to display: up to 4 pages before and
   * after the current page, always including the first and last page,
   * with an 'ellipsis' entry marking any skipped range.
   */
  public pageNumbers = computed<(number | 'ellipsis')[]>(() => {
    const current = this.pageNumber();
    const max = this.maxPages();
    if (max < 0) return [];

    const windowStart = Math.max(0, current - 2);
    const windowEnd = Math.min(max, current + 2);
    const pages: (number | 'ellipsis')[] = [];

    if (windowStart > 0) {
      pages.push(0);
      if (windowStart > 1) pages.push('ellipsis');
    }
    for (let page = windowStart; page <= windowEnd; page++) {
      pages.push(page);
    }
    if (windowEnd < max) {
      if (windowEnd < max - 1) pages.push('ellipsis');
      pages.push(max);
    }

    return pages;
  });

  public now = toSignal(interval(1000).pipe(map(() => Date.now())), { initialValue: Date.now() });

  public itemCardTopBottom: boolean = false;
  public modalRow = signal<IAuctionItem | null>(null);

  public error = this.auctionService.error;
  public loading = this.auctionService.loading;

  constructor() {
    // Reset to page 0 whenever the result set changes (new filter or new data).
    effect(() => {
      this.filteredAuctions();
      untracked(() => this.pageNumber.set(0));
    });
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
   * Order the given auctions by the given column, alternating between
   * ascending and descending
   * @param { IAuctionItem[] } auctions
   * @param { { column: string, reverse: boolean } } sort
   * @returns { IAuctionItem[] }
   */
  private _sortAuctions(auctions: IAuctionItem[], sort: { column: string; reverse: boolean }): IAuctionItem[] {
    if (!sort.column) return auctions;
    const sorted = [...auctions].sort((a, b) => {
      switch (sort.column) {
        case "Auction Type":
          return a.bin === b.bin ? 0 : a.bin ? 1 : -1;
        case "Item":
          return a.item_name.localeCompare(b.item_name);
        case "Current Bid":
          return Math.max(a.starting_bid, a.highest_bid_amount) - Math.max(b.starting_bid, b.highest_bid_amount);
        case "Time Remaining":
          return a.end - b.end;
        default:
          return 0;
      }
    });
    return sort.reverse ? sorted.reverse() : sorted;
  }

  /**
   * Set the items per page and page start/end when page size is modified
   * @param { Event } event
   */
  public onPageSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage.set(+selectElement.value);
  }

  /**
   * Set current page number
   * @param { Number } pageChange
   */
  public onPageChange(pageChange: number): void {
    this.pageNumber.update(n => Math.max(Math.min(n + pageChange, this.maxPages()), 0));
  }

  /**
   * Jump directly to the given page number, clamped to the valid range
   * @param { number } page
   */
  public goToPage(page: number): void {
    this.pageNumber.set(Math.max(Math.min(page, this.maxPages()), 0));
  }

  /**
   * Jump to the first page
   */
  public goToFirstPage(): void {
    this.pageNumber.set(0);
  }

  /**
   * Jump to the last page
   */
  public goToLastPage(): void {
    this.pageNumber.set(this.maxPages());
  }

  /**
   * Order the filtered auctions by the given column, alternating between
   * ascending and descending
   * @param { string } column
   */
  public onSortColumn(column: string): void {
    this.sortedColumn.update(current =>
      current.column === column && !current.reverse
        ? { column, reverse: true }
        : { column, reverse: false }
    );
  }

  /**
   * Align the info card by top or bottom depending if the mouse enters via
   * the upper or lower half of the screen, respectively
   * @param { MouseEvent } event
   */
  public setItemCardTopBottom(event: MouseEvent): void {
    this.itemCardTopBottom = event.clientY > window.innerHeight / 2
  }

  public openModal(row: IAuctionItem): void {
    this.modalRow.set(row);
  }

  public closeModal(): void {
    this.modalRow.set(null);
  }

  /**
   * Stops the click event from propogating when clicking the inner div
   * @param event
   */
  public stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
