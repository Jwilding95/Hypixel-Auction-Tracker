import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RecommendationSystemComponent } from './components/recommendation-system/recommendation-system.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'recommendation-system', component: RecommendationSystemComponent },
    { path: '**', redirectTo: '/home', pathMatch: 'full' },
];
