import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdvancedSearchComponent } from './components/advanced-search/advanced-search.component';
import { BazaarComponent } from './bazaar/bazaar.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'advanced-search', component: AdvancedSearchComponent },
    { path: 'bazaar', component: BazaarComponent },
    { path: '**', redirectTo: '/home', pathMatch: 'full' },
];
