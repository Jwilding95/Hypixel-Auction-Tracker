import { Component, EventEmitter, Output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, NgForm } from '@angular/forms';
import { AuctionsService } from '../../services/auctions/auctions.service';
import { DEFAULT_FILTER, IFilter } from '../../models/filter.model';
import { IFilterDropdown } from '../../models/filterDropdown.model';
import { ClickableDirective } from '../../directives/clickable.directive';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [TitleCasePipe, MatIconModule, FormsModule, ClickableDirective],
  templateUrl: './advanced-search.component.html',
  styleUrl: './advanced-search.component.scss'
})
export class AdvancedSearchComponent {

  public MAX_BID_AMOUNT: number = 100_000_000_000;

  public filterDropdowns: Record<'auctionType' | 'category' | 'tier', IFilterDropdown> = {
    auctionType: {label: "Auction Type", select: "auctionType", options: [ "All", "Auction", "BIN" ]},
    category: {label: "Category", select: "category", options: [ "misc", "accessories", "armor", "weapon", "blocks", "consumables" ]},
    tier: {label: "Tier", select: "tier", options: [ "COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC", "DIVINE", "SPECIAL", "VERY SPECIAL", "ULTIMATE" ]}
  };

  public filterObject: IFilter = { ...DEFAULT_FILTER };

  @Output() closeSidebar = new EventEmitter<void>();

  constructor (
    private auctionService: AuctionsService,
  ) {}

  /**
   * Extract and transform advanced search form values, pass them to
   * auction service to cast it to the filter observable, then close
   * the sidebar
   * @param { NgForm } form - Form of advance search values
   */
  public onSubmit(form: NgForm) {
    form.value.searchArray = form.value.searchString.split(/\,\s|\s/g)
    form.value.excludeArray = form.value.excludeString.split(/\,\s|\s/g)
    // minBid/maxBid come from text inputs, so form.value holds them as strings
    // (or null when untouched) — convert to numbers so downstream "0 means no
    // limit" checks (e.g. table.component.ts's `!filterObject.maxBid`) work
    // correctly. Without this, a submitted string "0" is truthy in JS and
    // would filter out every auction instead of being treated as unset.
    form.value.minBid = form.value.minBid ? Number(form.value.minBid) : 0
    form.value.maxBid = form.value.maxBid ? Number(form.value.maxBid) : 0
    this.auctionService.setFilter(form.value)
    this.closeSidebar.emit();
  }

}
