import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableComponent } from './components/table/table.component';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './components/filter/filter.component';
import { HeaderComponent } from './components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TableComponent, FilterComponent, HeaderComponent, MatIconModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppComponent {

}
