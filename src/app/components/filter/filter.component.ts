import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { IFilter } from '../../models/filter.model';
import { AuctionsService } from '../../services/auctions/auctions.service';
import { TitleCasePipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { IChip } from '../../models/chip.model';
import { TitlePipe } from '../../pipes/title.pipe';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe, MatAutocompleteModule, AsyncPipe, ReactiveFormsModule, MatIconModule, RouterModule, TitlePipe],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent implements OnInit {

  public categories = {label: "Category", select: "category", options: [ "misc", "accessories", "armor", "weapon", "blocks", "consumables" ]}

  private _filterObject: IFilter = {
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

  public searchForm: FormControl = new FormControl('');
  public categoryForm: FormControl = new FormControl('');

  activeFilters: IChip[] = []

  constructor (
    private auctionService: AuctionsService,
  ) {}

  ngOnInit(): void {
    this.auctionService.filter$.subscribe(filter => {
      this._filterObject = filter
      this.searchForm.setValue(`${filter.searchString ? filter.searchArray.join(" ") : ""}${filter.excludeString ? " " + filter.excludeArray.map((e: string) => e.startsWith('-') ? e : `-${e}`).join(" ") : ""}`)
      this.categoryForm.setValue(filter.category)
      this.setActiveFilters(filter)
    })
  }

  /**
   * Extract and transform search form values, pass them to
   * auction service to cast it to the filter observable.
   * Removes focus from the search input 
   */
  public setFilter(): void {
    document.getElementById('search')?.blur();
    const { exclude, search } = this.searchForm.value.split(/\,\s|\s/g).reduce((acc: { exclude: string[], search: string[] }, word: string) => {
      if (word.startsWith('-')) {
        acc.exclude.push(word.replace(/^-+/g, ""))
      } else {
        acc.search.push(word)
      }
      return acc
    }, { exclude: [], search: [] })
    this._filterObject.searchArray = search;
    this._filterObject.searchString = this._filterObject.searchArray.join(" ");
    this._filterObject.excludeArray = exclude;
    this._filterObject.excludeString = this._filterObject.excludeArray.join(" ");
    this._filterObject.category = this.categoryForm.value;
    this.auctionService.setFilter(this._filterObject);
  }

  /**
   * Create an array of filter objects based on active advanced search filters.
   * set activeFilters equal to the output for filter chips.
   * @param { IFilter } filter 
   */
  setActiveFilters(filter: IFilter): void {
    let filters: IChip[] = []
    if (filter.itemDescription != false) { filters.push({ label: 'Item Description', data: "Included", prop: 'itemDescription' }) };
    if (filter.auctionType != 'all') { filters.push({ label: 'Auction Type', data: filter.auctionType, prop: 'auctionType' }) };
    if (filter.minBid != 0) { filters.push({ label: 'Min Bid', data: filter.minBid, prop: 'minBid' }) };
    if (filter.maxBid != 0) { filters.push({ label: 'Max Bid', data: filter.maxBid, prop: 'maxBid' }) };
    if (filter.tier != 'all') { filters.push({ label: 'Tier', data: filter.tier, prop: 'tier' }) };
    this.activeFilters = filters;
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
    this._filterObject[prop] = defaults[prop] as string | number | boolean | string[];
    this.auctionService.setFilter(this._filterObject);
  }
}
