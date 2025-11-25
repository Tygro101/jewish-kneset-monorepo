import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
    { path: 'dashboard', loadComponent: () => DashboardComponent },
    { path: '**', redirectTo: '/dashboard', pathMatch: 'full' }
];
