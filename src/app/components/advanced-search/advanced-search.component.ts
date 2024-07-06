import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuctionsService } from '../../services/auctions/auctions.service';
import { IFilter } from '../../models/filter.model';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, MatIconModule, RouterModule, FormsModule],
  templateUrl: './advanced-search.component.html',
  styleUrl: './advanced-search.component.scss'
})
export class AdvancedSearchComponent {

  public MAX_BID_AMOUNT: number = 100_000_000_000;

  public filterDropdowns = {
    auctionType: {label: "Auction Type", select: "auctionType", options: [ "All", "Auction", "BIN" ]},
    category: {label: "Category", select: "category", options: [ "misc", "accessories", "armor", "weapon", "blocks", "consumables" ]},
    tier: {label: "Tier", select: "tier", options: [ "COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC", "DIVINE", "SPECIAL", "VERY SPECIAL", "ULTIMATE" ]}
  };

  public filterObject: IFilter = {
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

  constructor (
    private auctionService: AuctionsService,
    private router: Router
  ) {}

  /**
   * Extract and transform advanced search form values, pass them to
   * auction service to cast it to the filter observable.
   * Navigate to /home
   * @param { NgForm } form - Form of advance search values
   */
  public onSubmit(form: NgForm) {
    form.value.searchArray = form.value.searchString.split(/\,\s|\s/g)
    form.value.excludeArray = form.value.excludeString.split(/\,\s|\s/g)
    form.value.minBid = form.value.minBid === null ? 0 : form.value.minBid
    form.value.maxBid = form.value.maxBid === null ? 0 : form.value.maxBid
    this.auctionService.setFilter(form.value)
    this.router.navigate(['home'])
  }

}
