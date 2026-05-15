import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="view-header flex-header">
      <div>
        <h1>Products</h1>
        <p>Manage catalog items, pricing, and reorder thresholds.</p>
      </div>
      <button *ngIf="canEdit" class="btn-primary" (click)="addNew.emit()">+ New Product</button>
    </header>

    <!-- Filters Row -->
    <div class="filters-row card">
      <div class="search-box">
        <span>🔍</span>
        <input type="text" [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search products...">
      </div>
      <div class="filter-group">
        <label>Status</label>
        <select [(ngModel)]="statusFilter" (change)="onSearch()" class="form-select">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Products Table -->
    <div class="card table-card">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Reorder Level</th>
              <th>Barcode</th>
              <th>Status</th>
              <th *ngIf="canEdit">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filtered; let i = index">
              <td>
                <div class="product-cell">
                  <div class="product-name">{{ p.name }}</div>
                  <div class="product-num">#{{ i + 1 }}</div>
                </div>
              </td>
              <td class="sku-cell">{{ p.sku }}</td>
              <td>₹{{ p.sellingPrice | number:'1.2-2' }}</td>
              <td>{{ p.reorderLevel || p.reorder_level || '—' }}</td>
              <td class="barcode-cell">{{ p.barcode || '—' }}</td>
              <td>
                <span class="tag-active" *ngIf="p.active !== false">ACTIVE</span>
                <span class="tag-inactive" *ngIf="p.active === false">INACTIVE</span>
              </td>
              <td *ngIf="canEdit">
                <div class="action-btns">
                  <button class="btn-icon-text" (click)="edit.emit(p)">✏️</button>
                  <button class="btn-deactivate" (click)="deactivate.emit(p.id)" *ngIf="p.active !== false">Deactivate</button>
                  <button class="btn-activate" (click)="activate.emit(p.id)" *ngIf="p.active === false">Activate</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="7" class="empty-state">No products found.</td>
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
    .flex-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .filters-row { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 1.5rem; margin-bottom: 1rem; border-radius: 1rem; background: white; border: 1px solid #f1f5f9; }
    .search-box { display: flex; align-items: center; gap: 0.5rem; flex-grow: 1; border: 2px solid #f1f5f9; border-radius: 0.75rem; padding: 0.6rem 1rem; }
    .search-box input { border: none; outline: none; width: 100%; font-size: 0.9rem; }
    .filter-group { display: flex; flex-direction: column; gap: 0.2rem; min-width: 150px; }
    .filter-group label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
    .form-select { border: 2px solid #f1f5f9; border-radius: 0.5rem; padding: 0.4rem 0.75rem; background: white; font-size: 0.9rem; }
    .card { background: white; border-radius: 1.25rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .table-card { padding: 0; overflow: hidden; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem 1.25rem; font-size: 0.78rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; font-weight: 700; }
    td { padding: 1rem 1.25rem; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; }
    .product-name { font-weight: 700; color: #1e293b; }
    .product-num { font-size: 0.75rem; color: #94a3b8; }
    .sku-cell { font-family: monospace; color: #6366f1; }
    .barcode-cell { font-family: monospace; color: #64748b; font-size: 0.85rem; }
    .tag-active { background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 800; }
    .tag-inactive { background: #f1f5f9; color: #64748b; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 800; }
    .btn-primary { background: #6366f1; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
    .action-btns { display: flex; align-items: center; gap: 0.5rem; }
    .btn-icon-text { background: none; border: 1px solid #e2e8f0; padding: 0.35rem 0.6rem; border-radius: 0.5rem; cursor: pointer; }
    .btn-deactivate { background: none; border: 1px solid #e2e8f0; padding: 0.35rem 0.75rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.8rem; color: #64748b; font-weight: 600; }
    .btn-deactivate:hover { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
    .btn-activate { background: none; border: 1px solid #bbf7d0; padding: 0.35rem 0.75rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.8rem; color: #166534; font-weight: 600; }
    .empty-state { text-align: center; color: #94a3b8; padding: 3rem; }
  `]
})
export class ProductsViewComponent {
  @Input() canEdit = true;
  @Input() set products(val: any[]) { this._products = val; this.onSearch(); }
  @Output() addNew = new EventEmitter();
  @Output() edit = new EventEmitter<any>();
  @Output() deactivate = new EventEmitter<number>();
  @Output() activate = new EventEmitter<number>();

  _products: any[] = [];
  filtered: any[] = [];
  searchTerm = '';
  statusFilter = 'all';

  onSearch() {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this._products.filter(p => {
      const matchSearch = !t || p.name?.toLowerCase().includes(t) || p.sku?.toLowerCase().includes(t);
      const matchStatus = this.statusFilter === 'all' || (this.statusFilter === 'active' ? p.active !== false : p.active === false);
      return matchSearch && matchStatus;
    });
  }
}
