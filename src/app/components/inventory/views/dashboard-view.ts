import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../services/navigation';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="view-header">
      <h1>Dashboard</h1>
      <p>Welcome back, <strong>Himanshu Mishra</strong>. Your inventory is your business's heartbeat. Keep it steady, Keep it strong.</p>
    </header>

    <!-- 4 Stat Cards -->
    <div class="stats-ribbon">
      <div class="stat-box interactive-card">
        <div class="stat-top"><label>Total Products</label><span class="stat-icon pulse">🏷️</span></div>
        <span class="value">{{ inventory.length }}</span>
        <small>{{ inventory.length }} active items</small>
      </div>
      <div class="stat-box interactive-card">
        <div class="stat-top"><label>Warehouses</label><span class="stat-icon">🏭</span></div>
        <span class="value">{{ warehouses.length }}</span>
        <small>Active locations</small>
      </div>
      <div class="stat-box warn interactive-card">
        <div class="stat-top"><label>Unread Alerts</label><span class="stat-icon">🔔</span></div>
        <span class="value">{{ alerts.length }}</span>
        <small>Require attention</small>
      </div>
      <div class="stat-box info interactive-card">
        <div class="stat-top"><label>Pending POs</label><span class="stat-icon">📋</span></div>
        <span class="value">{{ getPendingPOs().length }}</span>
        <small>Awaiting action</small>
      </div>
    </div>

    <!-- Two-column layout -->
    <div class="dash-grid">
      <!-- Recent Alerts -->
      <div class="card">
        <div class="card-header"><h2>Recent Alerts</h2></div>
        <div class="alert-list">
          <div class="alert-row" *ngFor="let a of alerts.slice(0,5)">
            <span class="tag-low">LOW_STOCK</span>
            <p class="alert-text">{{ a.alertMessage || 'Low stock alert for product #' + a.productId + ' in Warehouse #' + a.warehouseId }}</p>
          </div>
          <div *ngIf="alerts.length === 0" class="empty-state">✅ No active alerts</div>
        </div>
      </div>

      <!-- Active Purchase Orders -->
      <div class="card">
        <div class="card-header"><h2>Active Purchase Orders</h2></div>
        <div class="alert-list">
          <div class="alert-row po-row" *ngFor="let po of getPendingPOs().slice(0,5)">
            <span class="tag-po">{{ po.status }}</span>
            <p class="alert-text">
              <strong>{{ getProductName(po.productId || po.items?.[0]?.productId) }}</strong> — Qty: {{ po.quantity || po.items?.[0]?.quantity }}
            </p>
          </div>
          <div *ngIf="getPendingPOs().length === 0" class="empty-state">No active orders</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .view-header { margin-bottom: 2.5rem; }
    .view-header h1 { font-size: 2.5rem; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -1px; }
    .view-header p { color: #64748b; margin: 0.5rem 0 0; font-size: 1.1rem; }
    .view-header strong { color: #6366f1; }
    .stats-ribbon { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
    .stat-box { background: white; padding: 1.75rem; border-radius: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
    .interactive-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); border-color: #6366f1; cursor: pointer; }
    .stat-box.warn { border-left: 5px solid #f59e0b; }
    .stat-box.info { border-left: 5px solid #6366f1; }
    .stat-top { display: flex; justify-content: space-between; align-items: center; }
    .stat-top label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-icon { font-size: 1.75rem; transition: transform 0.3s ease; }
    .interactive-card:hover .stat-icon { transform: scale(1.2) rotate(10deg); }
    .value { font-size: 3rem; font-weight: 900; color: #0f172a; display: block; margin: 0.75rem 0 0.25rem; letter-spacing: -1px; }
    small { color: #64748b; font-size: 0.85rem; font-weight: 500; }
    .pulse { animation: pulse-animation 2s infinite; }
    @keyframes pulse-animation { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
    .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .card { background: white; border-radius: 1.5rem; padding: 1.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
    .card-header { margin-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }
    .card-header h2 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; }
    .alert-row { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #f8fafc; transition: background 0.2s; border-radius: 0.5rem; }
    .alert-row:hover { background: #f8fafc; padding-left: 0.5rem; }
    .alert-text { font-size: 0.9rem; color: #475569; margin: 0; line-height: 1.6; }
    .tag-low { background: #fef2f2; color: #dc2626; padding: 0.25rem 0.6rem; border-radius: 0.5rem; font-size: 0.7rem; font-weight: 800; white-space: nowrap; }
    .tag-po { background: #fffbeb; color: #d97706; padding: 0.25rem 0.6rem; border-radius: 0.5rem; font-size: 0.7rem; font-weight: 800; white-space: nowrap; }
    .empty-state { color: #94a3b8; text-align: center; padding: 3rem; font-size: 1rem; font-weight: 500; }
  `]
})
export class DashboardViewComponent {
  @Input() inventory: any[] = [];
  @Input() warehouses: any[] = [];
  @Input() alerts: any[] = [];
  @Input() purchaseOrders: any[] = [];
  
  constructor(private nav: NavigationService) {}

  getPendingPOs() {
    return this.purchaseOrders.filter(po => 
      po.status === 'DRAFT' || 
      po.status === 'PENDING_APPROVAL' || 
      po.status === 'APPROVED' || 
      po.status === 'PENDING'
    );
  }

  getProductName(id: any) {
    return this.inventory.find(p => p.id?.toString() === id?.toString())?.name || 'Product #' + id;
  }
}
