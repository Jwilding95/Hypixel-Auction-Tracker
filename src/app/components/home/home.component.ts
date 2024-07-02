import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableComponent } from '../table/table.component';
import { CommonModule } from '@angular/common';
import { FilterComponent } from '../filter/filter.component';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TableComponent, FilterComponent, HeaderComponent, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  public hasYoffset: boolean = false;
  public baseHref = document.location.href

  /**
   * Sets hasYoffset to a boolean value respective of whether the scroll has 
   * passed the height of the header element
   */
  @HostListener('window:scroll', ['$event']) onWindowScroll(): void {
    this.hasYoffset = window.scrollY > 50;
  }

}
