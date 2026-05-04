import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-suppliers-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="view-header flex-header">
      <div>
        <h1>Suppliers</h1>
        <p>Keep vendor details and availability up to date.</p>
      </div>
      <button class="btn-primary" (click)="addNew.emit()">🤝 New Supplier</button>
    </header>

    <!-- Filters -->
    <div class="filters-row card">
      <div class="search-box">
        <span>🔍</span>
        <input type="text" [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Search suppliers...">
      </div>
      <div class="filter-group">
        <label>Status</label>
        <select [(ngModel)]="statusFilter" (change)="applyFilter()" class="form-select">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card table-card">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of filtered">
              <td>
                <div class="supplier-name">{{ s.name }}</div>
                <div class="supplier-addr">{{ s.address || '—' }}</div>
              </td>
              <td>{{ s.contactPerson || '—' }}</td>
              <td class="email-cell">{{ s.email }}</td>
              <td>{{ s.phone || '—' }}</td>
              <td>
                <span class="tag-active" *ngIf="s.active !== false">ACTIVE</span>
                <span class="tag-inactive" *ngIf="s.active === false">INACTIVE</span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn-icon-sm" (click)="edit.emit(s)" title="Edit">✏️</button>
                  <button class="btn-deactivate" (click)="deactivate.emit(s.id)" *ngIf="s.active !== false">Deactivate</button>
                  <button class="btn-activate" (click)="activate.emit(s.id)" *ngIf="s.active === false">Activate</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="6" class="empty-state">No suppliers found.</td>
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
    .btn-primary { background: #6366f1; color: white; border: none; padding: 0.7rem 1.25rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
    .filters-row { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 1.5rem; margin-bottom: 1rem; border-radius: 1rem; background: white; border: 1px solid #f1f5f9; }
    .search-box { display: flex; align-items: center; gap: 0.5rem; flex-grow: 1; border: 2px solid #f1f5f9; border-radius: 0.75rem; padding: 0.6rem 1rem; }
    .search-box input { border: none; outline: none; width: 100%; font-size: 0.9rem; }
    .filter-group { display: flex; flex-direction: column; gap: 0.2rem; min-width: 150px; }
    .filter-group label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
    .form-select { border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; background: white; font-size: 0.9rem; }
    .card { background: white; border-radius: 1.25rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .table-card { overflow: hidden; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem 1.25rem; font-size: 0.78rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; font-weight: 700; }
    td { padding: 1rem 1.25rem; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; }
    .supplier-name { font-weight: 700; color: #1e293b; }
    .supplier-addr { font-size: 0.75rem; color: #94a3b8; margin-top: 0.15rem; }
    .email-cell { color: #6366f1; font-size: 0.85rem; }
    .tag-active { background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 800; }
    .tag-inactive { background: #f1f5f9; color: #64748b; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 800; }
    .action-btns { display: flex; align-items: center; gap: 0.5rem; }
    .btn-icon-sm { background: none; border: 1px solid #e2e8f0; padding: 0.35rem 0.6rem; border-radius: 0.5rem; cursor: pointer; }
    .btn-deactivate { background: none; border: 1px solid #e2e8f0; padding: 0.35rem 0.75rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.8rem; color: #64748b; font-weight: 600; }
    .btn-deactivate:hover { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
    .btn-activate { background: none; border: 1px solid #bbf7d0; padding: 0.35rem 0.75rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.8rem; color: #166534; font-weight: 600; }
    .empty-state { text-align: center; color: #94a3b8; padding: 3rem; }
  `]
})
export class SuppliersViewComponent {
  @Input() set suppliers(val: any[]) { this._suppliers = val || []; this.applyFilter(); }
  @Output() addNew = new EventEmitter();
  @Output() edit = new EventEmitter<any>();
  @Output() deactivate = new EventEmitter<number>();
  @Output() activate = new EventEmitter<number>();

  _suppliers: any[] = [];
  filtered: any[] = [];
  searchTerm = '';
  statusFilter = 'all';

  applyFilter() {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this._suppliers.filter(s => {
      const matchSearch = !t || s.name?.toLowerCase().includes(t) || s.email?.toLowerCase().includes(t) || s.contactPerson?.toLowerCase().includes(t);
      const matchStatus = this.statusFilter === 'all' || (this.statusFilter === 'active' ? s.active !== false : s.active === false);
      return matchSearch && matchStatus;
    });
  }
}
