import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="view-header">
      <h1>Reports</h1>
      <p>Stock valuation and low stock exposure across the business.</p>
    </header>

    <!-- Summary Cards -->
    <div class="summary-ribbon">
      <div class="summary-card">
        <label>Total Inventory Value (Cost)</label>
        <span class="big-value">₹{{ totalValue | number:'1.2-2' }}</span>
      </div>
      <div class="summary-card">
        <label>Total Products</label>
        <span class="big-value">{{ inventory.length }}</span>
      </div>
      <div class="summary-card">
        <label>Total Units</label>
        <span class="big-value">{{ totalUnits }}</span>
      </div>
      <div class="summary-card danger">
        <label>Low Stock Products</label>
        <span class="big-value danger-text">{{ lowStockCount }}</span>
      </div>
    </div>

    <!-- Stock Value Breakdown -->
    <div class="card table-card">
      <div class="card-header"><h2>Stock Value Breakdown</h2></div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr><th>Product</th><th>SKU</th><th>Quantity</th><th>Unit Price</th><th>Total Value</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of inventory">
              <td class="bold-cell">{{ p.name }}</td>
              <td class="sku-cell">{{ p.sku }}</td>
              <td>{{ p.currentStockLevel }}</td>
              <td>₹{{ p.costPrice | number:'1.2-2' }}</td>
              <td class="bold-cell">₹{{ (p.costPrice * p.currentStockLevel) | number:'1.2-2' }}</td>
            </tr>
            <tr *ngIf="inventory.length === 0">
              <td colspan="5" class="empty-state">No inventory data.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .view-header { margin-bottom: 1.5rem; }
    .view-header h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
    .view-header p { color: #64748b; margin: 0.25rem 0 0; }
    .summary-ribbon { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
    .summary-card { background: white; padding: 1.5rem; border-radius: 1.25rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .summary-card.danger { border-left: 4px solid #ef4444; }
    .summary-card label { font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 0.5rem; }
    .big-value { font-size: 2rem; font-weight: 800; color: #0f172a; }
    .danger-text { color: #ef4444; }
    .card { background: white; border-radius: 1.25rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .card-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
    .card-header h2 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }
    .table-card { overflow: hidden; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem 1.25rem; font-size: 0.78rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; font-weight: 700; }
    td { padding: 1rem 1.25rem; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; }
    .bold-cell { font-weight: 700; color: #1e293b; }
    .sku-cell { font-family: monospace; color: #6366f1; }
    .empty-state { text-align: center; color: #94a3b8; padding: 3rem; }
  `]
})
export class ReportsViewComponent {
  @Input() inventory: any[] = [];
  get totalValue() { return this.inventory.reduce((s, p) => s + (p.costPrice * p.currentStockLevel), 0); }
  get totalUnits() { return this.inventory.reduce((s, p) => s + (p.currentStockLevel || 0), 0); }
  get lowStockCount() { return this.inventory.filter(p => p.currentStockLevel <= (p.reorderLevel || 10)).length; }
}
