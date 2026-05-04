import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { NavigationService, DashboardView } from '../../services/navigation';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="sidebar shadow-xl">
      <div class="brand">
        <span class="logo-icon">📦</span>
        <div>
          <h3>StockPro</h3>
          <span class="role-badge">{{ userRole }}</span>
        </div>
      </div>
      <ul class="nav-links">
        <li *ngFor="let item of filteredMenuItems">
          <a (click)="switchView(item.id)" [class.active]="currentView === item.id">
            <span class="icon">{{ item.icon }}</span> {{ item.label }}
          </a>
        </li>
      </ul>
      <div class="sidebar-footer">
        <button (click)="logout()" class="btn-logout"><span class="icon">🚪</span> Sign Out</button>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar { width: 240px; height: 100vh; background: #1e2a3a; color: white; display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 1001; }
    .brand { padding: 1.5rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .logo-icon { font-size: 1.75rem; }
    h3 { margin: 0; font-size: 1.15rem; font-weight: 800; color: white; }
    .role-badge { background: rgba(99,102,241,0.3); color: #a5b4fc; font-size: 0.6rem; padding: 0.15rem 0.5rem; border-radius: 0.25rem; font-weight: 800; letter-spacing: 0.05em; }
    .nav-links { list-style: none; padding: 1rem 0; margin: 0; flex-grow: 1; overflow-y: auto; }
    .nav-links a { display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 1.5rem; color: #94a3b8; text-decoration: none; transition: all 0.2s; cursor: pointer; font-size: 0.9rem; border-left: 3px solid transparent; }
    .nav-links a:hover { background: rgba(255,255,255,0.05); color: white; }
    .nav-links a.active { background: rgba(99,102,241,0.15); color: white; border-left-color: #6366f1; font-weight: 600; }
    .icon { font-size: 1rem; width: 20px; text-align: center; }
    .sidebar-footer { padding: 1.25rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
    .btn-logout { width: 100%; background: transparent; border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; padding: 0.6rem; border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 600; font-size: 0.85rem; }
    .btn-logout:hover { background: rgba(239,68,68,0.15); }
  `]
})
export class SidebarComponent {
  currentView: DashboardView = 'dashboard';
  menuItems: { id: DashboardView, icon: string, label: string }[] = [
    { id: 'dashboard',  icon: '⊞',  label: 'Dashboard' },
    { id: 'products',   icon: '🏷️', label: 'Products' },
    { id: 'suppliers',  icon: '🤝', label: 'Suppliers' },
    { id: 'warehouses', icon: '🏠', label: 'Warehouses' },
    { id: 'purchase',   icon: '📋', label: 'Purchase Orders' },
    { id: 'sales',      icon: '🛒', label: 'Sales Orders' },
    { id: 'movements',  icon: '↔️', label: 'Movements' },
    { id: 'alerts',     icon: '🔔', label: 'Alerts' },
    { id: 'reports',    icon: '📊', label: 'Reports' },
    { id: 'users',      icon: '👥', label: 'Users' },
  ];

  constructor(public authService: AuthService, private router: Router, private navService: NavigationService) {
    this.navService.currentView$.subscribe(view => this.currentView = view);
  }

  get userRole() {
    return this.authService.getRole().replace('_', ' ');
  }

  get filteredMenuItems() {
    const role = this.authService.getRole();
    if (role === 'ADMIN') return this.menuItems;
    
    if (role === 'INVENTORY_MANAGER') {
      return this.menuItems.filter(item => ['dashboard', 'products', 'warehouses', 'sales', 'movements', 'alerts', 'reports'].includes(item.id));
    }
    
    if (role === 'WAREHOUSE_STAFF') {
      return this.menuItems.filter(item => ['dashboard', 'warehouses', 'sales', 'movements', 'alerts'].includes(item.id));
    }
    
    if (role === 'PURCHASE_OFFICER') {
      return this.menuItems.filter(item => ['dashboard', 'suppliers', 'purchase'].includes(item.id));
    }
    
    return [this.menuItems[0]]; // Default to just dashboard
  }

  switchView(view: DashboardView) { this.navService.setView(view); this.router.navigate(['/inventory']); }
  logout() { this.authService.logout(); this.router.navigate(['/login']); }
}
