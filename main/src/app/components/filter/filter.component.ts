import { Component, EventEmitter, Output, computed, effect, inject, untracked } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { IFilter } from '../../models/filter.model';
import { AuctionsService } from '../../services/auctions/auctions.service';
import { TitleCasePipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { IChip } from '../../models/chip.model';
import { IFilterDropdown } from '../../models/filterDropdown.model';
import { TitlePipe } from '../../pipes/title.pipe';
import { ClickableDirective } from '../../directives/clickable.directive';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [FormsModule, TitleCasePipe, MatAutocompleteModule, AsyncPipe, ReactiveFormsModule, MatIconModule, TitlePipe, ClickableDirective],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent {

  private auctionService = inject(AuctionsService);

  @Output() openAdvancedSearch = new EventEmitter<void>();

  private _tierOptions: string[] = [ "common", "uncommon", "rare", "epic", "legendary", "mythic", "divine", "special", "very special", "ultimate" ]
  private _categoryOptions: string[] = [ "misc", "accessories", "armor", "weapon", "blocks", "consumables" ]
  public categories: IFilterDropdown = {label: "Category", select: "category", options: [ "misc", "accessories", "armor", "weapon", "blocks", "consumables" ]}

  public searchForm: FormControl = new FormControl('');
  public categoryForm: FormControl = new FormControl('');

  public activeFilters = computed<IChip[]>(() => this._buildActiveFilters(this.auctionService.filter()));

  constructor() {
    effect(() => {
      const filter = this.auctionService.filter();
      untracked(() => {
        this.searchForm.setValue(`${filter.searchString ? filter.searchArray.join(" ") : ""}${filter.excludeString ? " " + filter.excludeArray.map((e: string) => e.startsWith('-') ? e : `-${e}`).join(" ") : ""}`);
        this.categoryForm.setValue(filter.category);
      });
    });
  }

  /**
   * Extract and transform search form values, pass them to
   * auction service to cast it to the filter observable.
   * Removes focus from the search input
   */
  public setFilter(): void {
    document.getElementById('search')?.blur();
    const { exclude, search, tier, category } = this.searchForm.value.split(/\,\s|\s/g).reduce((acc: {
      exclude: string[]
      , search: string[]
      , tier: string
      , category: string
    }, word: string) => {
      if (word.startsWith('-')) {
        acc.exclude.push(word.replace(/^-+/g, ""))
      } else if (word.split(":")[0] === "tier" && this._tierOptions.includes(word.split(":")[1].toLowerCase())) {
        acc.tier = word.split(":")[1]
      } else if (word.split(":")[0] === "category" && this._categoryOptions.includes(word.split(":")[1].toLowerCase())) {
        acc.category = word.split(":")[1]
      } else {
        acc.search.push(word)
      }
      return acc
    }, { exclude: [], search: [], tier: "", category: "" })
    const filterObject: IFilter = { ...this.auctionService.filter() };
    filterObject.searchArray = search;
    filterObject.searchString = filterObject.searchArray.join(" ");
    filterObject.excludeArray = exclude;
    filterObject.excludeString = filterObject.excludeArray.join(" ");
    filterObject.tier = tier || filterObject.tier;
    filterObject.category = category || this.categoryForm.value;
    this.auctionService.setFilter(filterObject);
  }

  /**
   * Create an array of filter objects based on active advanced search filters.
   * @param { IFilter } filter
   * @returns { IChip[] }
   */
  private _buildActiveFilters(filter: IFilter): IChip[] {
    let filters: IChip[] = []
    if (filter.itemDescription != false) { filters.push({ label: 'Item Description', data: "Included", prop: 'itemDescription' }) };
    if (filter.auctionType != 'all') { filters.push({ label: 'Auction Type', data: filter.auctionType, prop: 'auctionType' }) };
    if (filter.minBid != 0) { filters.push({ label: 'Min Bid', data: filter.minBid, prop: 'minBid' }) };
    if (filter.maxBid != 0) { filters.push({ label: 'Max Bid', data: filter.maxBid, prop: 'maxBid' }) };
    if (filter.tier != 'all') { filters.push({ label: 'Tier', data: filter.tier, prop: 'tier' }) };
    return filters;
  }

  /**
   * Replace the filter property's value with its default value.
   * Cast the updated filter
   * @param { keyof IFilter } prop
   */
  removeFilter(prop: keyof IFilter): void {
    const defaults: Partial<IFilter> = {
      itemDescription: false,
      auctionType: "all",
      minBid: 0,
      maxBid: 0,
      category: "all",
      tier: "all",
    };
    const filterObject: IFilter = { ...this.auctionService.filter() };
    filterObject[prop] = defaults[prop] as string | number | boolean | string[];
    this.auctionService.setFilter(filterObject);
  }
}
