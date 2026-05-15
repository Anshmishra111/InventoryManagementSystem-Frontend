import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movements-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="view-header">
      <h1>Stock Movements</h1>
      <p>Review inbound and outbound stock activity across warehouses.</p>
    </header>

    <!-- Filters -->
    <div class="filters-bar card">
      <div class="filter-group">
        <label>Type</label>
        <select [(ngModel)]="typeFilter" (change)="applyFilters()" class="form-select">
          <option value="">All types</option>
          <option value="IN">IN (Add Stock)</option>
          <option value="OUT">OUT (Deduct Stock)</option>
          <option value="INTERNAL">INTERNAL (Transfer)</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Product</label>
        <select [(ngModel)]="productFilter" (change)="applyFilters()" class="form-select">
          <option value="">All products</option>
          <option *ngFor="let p of products" [value]="p.id">{{ p.name }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Warehouse</label>
        <select [(ngModel)]="warehouseFilter" (change)="applyFilters()" class="form-select">
          <option value="">All warehouses</option>
          <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</option>
        </select>
      </div>
    </div>

    <!-- Movements Table -->
    <div class="card table-card">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Quantity</th>
              <th>Reference</th>
              <th>Performed By</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of filtered">
              <td class="date-cell">{{ m.timestamp || m.movementDate || m.createdAt || m.date | date:'MMM d, y, h:mm a' }}</td>
              <td>
                <span class="tag-in" *ngIf="m.type === 'IN' || m.type === 'STOCK_IN'">STOCK_IN</span>
                <span class="tag-out" *ngIf="m.type === 'OUT' || m.type === 'STOCK_OUT'">STOCK_OUT</span>
                <span class="tag-transfer" *ngIf="m.type === 'INTERNAL' || m.type === 'TRANSFER_IN' || m.type === 'TRANSFER_OUT'">INTERNAL</span>
              </td>
              <td class="bold-cell">{{ getProductName(m.productId) }}</td>
              <td>{{ getWarehouseName(m.warehouseId || m.fromWarehouseId) }}</td>
              <td class="qty-cell">{{ m.quantity }}</td>
              <td class="ref-cell">
                <span *ngIf="m.referenceType">{{ m.referenceType }}</span>
                <span *ngIf="m.referenceId"> #{{ m.referenceId }}</span>
                <span *ngIf="!m.referenceType && !m.referenceId">#</span>
              </td>
              <td>{{ m.performedBy || 'User #' + (m.userId || 1) }}</td>
              <td class="notes-cell">{{ m.notes || m.reason || '—' }}</td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="8" class="empty-state">No movements found.</td>
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
    .filters-bar { display: flex; gap: 1.5rem; padding: 1rem 1.5rem; margin-bottom: 1rem; border-radius: 1rem; background: white; border: 1px solid #f1f5f9; }
    .filter-group { display: flex; flex-direction: column; gap: 0.2rem; min-width: 180px; }
    .filter-group label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
    .form-select { border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; background: white; font-size: 0.9rem; }
    .card { background: white; border-radius: 1.25rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .table-card { padding: 0; overflow: hidden; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem 1.25rem; font-size: 0.75rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; font-weight: 700; }
    td { padding: 0.9rem 1.25rem; border-bottom: 1px solid #f8fafc; font-size: 0.85rem; }
    .date-cell { color: #475569; font-size: 0.8rem; white-space: nowrap; }
    .bold-cell { font-weight: 700; color: #1e293b; }
    .qty-cell { font-weight: 700; color: #1e293b; }
    .ref-cell { font-family: monospace; color: #6366f1; font-size: 0.8rem; }
    .notes-cell { color: #64748b; font-size: 0.82rem; max-width: 200px; }
    .tag-in { background: #dcfce7; color: #166534; padding: 0.25rem 0.6rem; border-radius: 0.4rem; font-size: 0.7rem; font-weight: 800; }
    .tag-out { background: #fef2f2; color: #dc2626; padding: 0.25rem 0.6rem; border-radius: 0.4rem; font-size: 0.7rem; font-weight: 800; }
    .tag-transfer { background: #eff6ff; color: #1d4ed8; padding: 0.25rem 0.6rem; border-radius: 0.4rem; font-size: 0.7rem; font-weight: 800; }
    .empty-state { text-align: center; color: #94a3b8; padding: 3rem; }
  `]
})
export class MovementsViewComponent {
  @Input() set movements(val: any[]) { this._movements = val || []; this.applyFilters(); }
  @Input() products: any[] = [];
  @Input() warehouses: any[] = [];

  _movements: any[] = [];
  filtered: any[] = [];
  typeFilter = '';
  productFilter = '';
  warehouseFilter = '';

  applyFilters() {
    this.filtered = this._movements.filter(m => {
      const t = m.type || m.movementType || '';
      let matchType = !this.typeFilter;
      if (this.typeFilter === 'IN') matchType = t === 'IN' || t === 'STOCK_IN';
      else if (this.typeFilter === 'OUT') matchType = t === 'OUT' || t === 'STOCK_OUT';
      else if (this.typeFilter === 'INTERNAL') matchType = t === 'INTERNAL' || t === 'TRANSFER_IN' || t === 'TRANSFER_OUT';
      
      const matchProd = !this.productFilter || m.productId?.toString() === this.productFilter;
      const matchWh = !this.warehouseFilter || (m.warehouseId || m.fromWarehouseId)?.toString() === this.warehouseFilter;
      return matchType && matchProd && matchWh;
    });
  }

  getProductName(id: any): string {
    return this.products.find(p => p.id?.toString() === id?.toString())?.name || 'Product #' + id;
  }

  getWarehouseName(id: any): string {
    return this.warehouses.find(w => w.id?.toString() === id?.toString())?.name || 'Warehouse #' + id;
  }
}
