import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type DashboardView = 'dashboard' | 'products' | 'warehouses' | 'suppliers' | 'reports' | 'sales' | 'purchase' | 'movements' | 'alerts' | 'receive-po' | 'fulfill-so' | 'users';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private currentViewSubject = new BehaviorSubject<DashboardView>('dashboard');
  currentView$ = this.currentViewSubject.asObservable();
  setView(view: DashboardView) { this.currentViewSubject.next(view); }
}
