import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alerts-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="view-header flex-header">
      <div>
        <h1>Alerts</h1>
        <p>{{ unread }} unread alerts need attention.</p>
      </div>
      <button class="btn-mark-read" (click)="markAllRead()">✔ Mark All Read</button>
    </header>

    <div class="alerts-list card">
      <div class="alert-card" *ngFor="let a of alerts" [class.read]="a.read">
        <div class="alert-badge">LOW_STOCK</div>
        <div class="alert-body">
          <p class="alert-msg">{{ a.alertMessage || 'Low stock alert: Product ID ' + a.productId + ' in Warehouse ID ' + a.warehouseId + ' has only ' + a.currentStock + ' units (threshold: ' + a.threshold + '). Reorder recommended.' }}</p>
          <span class="alert-meta">{{ a.createdAt | date:'MMM d, y, h:mm a' }} • PRODUCT #{{ a.productId }}</span>
        </div>
      </div>
      <div class="empty-state" *ngIf="alerts.length === 0">✅ All clear! No active alerts.</div>
    </div>
  `,
  styles: [`
    .view-header { margin-bottom: 1.5rem; }
    .view-header h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
    .view-header p { color: #64748b; margin: 0.25rem 0 0; }
    .flex-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .btn-mark-read { background: white; border: 1px solid #e2e8f0; padding: 0.6rem 1.25rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer; font-size: 0.85rem; color: #475569; }
    .btn-mark-read:hover { background: #f1f5f9; }
    .card { background: white; border-radius: 1.25rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 0.5rem; }
    .alert-card { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem; border: 1px solid #f1f5f9; border-radius: 1rem; margin-bottom: 0.5rem; background: #fffbeb; }
    .alert-card.read { background: #f8fafc; opacity: 0.7; }
    .alert-badge { background: #fef2f2; color: #dc2626; padding: 0.25rem 0.6rem; border-radius: 0.4rem; font-size: 0.7rem; font-weight: 800; white-space: nowrap; height: fit-content; }
    .alert-body { flex-grow: 1; }
    .alert-msg { font-size: 0.9rem; color: #1e293b; margin: 0 0 0.25rem; line-height: 1.5; }
    .alert-meta { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
    .empty-state { text-align: center; color: #94a3b8; padding: 3rem; }
  `]
})
export class AlertsViewComponent {
  @Input() alerts: any[] = [];
  get unread() { return this.alerts.filter(a => !a.read).length; }
  markAllRead() { this.alerts.forEach(a => a.read = true); }
}
