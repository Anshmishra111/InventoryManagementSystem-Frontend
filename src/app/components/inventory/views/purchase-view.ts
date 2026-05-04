import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="view-header flex-header">
      <div>
        <h1>Purchase Orders</h1>
        <p>Create, approve, receive, and monitor order flow.</p>
      </div>
      <button *ngIf="canCreate" class="btn-primary" (click)="addNew.emit()">+ New PO</button>
    </header>

    <!-- Status Filter -->
    <div class="filters-row card">
      <div class="filter-group">
        <label>Status</label>
        <select [(ngModel)]="statusFilter" (change)="applyFilter()" class="form-select">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="APPROVED">Approved</option>
          <option value="FULLY_RECEIVED">Received</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- PO Table -->
    <div class="card table-card">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>PO #</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Items</th>
              <th>Total</th>
              <th *ngIf="canCreate || canApprove || canReceive">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let po of filtered">
              <td><div class="po-num">#{{ po.id }}</div></td>
              <td class="date-cell">{{ po.orderDate | date:'MMM d, y' }}</td>
              <td class="supplier-cell">{{ getSupplierName(po.supplierId) }}</td>
              <td>
                <span class="tag-received" *ngIf="po.status === 'FULLY_RECEIVED' || po.status === 'PARTIALLY_RECEIVED'">RECEIVED</span>
                <span class="tag-cancelled" *ngIf="po.status === 'CANCELLED'">CANCELLED</span>
                <span class="tag-approved" *ngIf="po.status === 'APPROVED'">APPROVED</span>
                <span class="tag-created" *ngIf="po.status === 'DRAFT'">DRAFT</span>
              </td>
              <td class="items-cell">
                <div *ngFor="let item of (po.items || [])" class="po-item-line">
                  {{ getProductName(item.productId) }} × {{ item.quantity }} @ ₹{{ item.unitPrice }}
                </div>
                <div *ngIf="!po.items || po.items.length === 0" class="po-item-line">
                  {{ getProductName(po.productId) }}
                </div>
              </td>
              <td class="total-cell">₹{{ (po.totalAmount || 0) | number:'1.2-2' }}</td>
              <td class="actions-cell" *ngIf="canCreate || canApprove || canReceive">
                <button class="btn-approve" *ngIf="po.status === 'DRAFT' && canApprove"
                  (click)="statusChange.emit({id: po.id, status: 'APPROVED'})">✓ Approve</button>
                <button class="btn-receive" *ngIf="po.status === 'APPROVED' && canReceive"
                  (click)="statusChange.emit({id: po.id, status: 'RECEIVED'})">📦 Receive</button>
                <button class="btn-cancel" *ngIf="(po.status === 'DRAFT' || po.status === 'APPROVED') && canApprove"
                  (click)="statusChange.emit({id: po.id, status: 'CANCELLED'})">✕</button>
                <span *ngIf="po.status === 'FULLY_RECEIVED' || po.status === 'CANCELLED' || (!canApprove && !canReceive)" class="status-final">—</span>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="8" class="empty-state">No purchase orders found.</td>
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
    .filter-group { display: flex; flex-direction: column; gap: 0.2rem; min-width: 200px; }
    .filter-group label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
    .form-select { border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; background: white; font-size: 0.9rem; }
    .card { background: white; border-radius: 1.25rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .table-card { overflow: hidden; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem 1.25rem; font-size: 0.78rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; font-weight: 700; }
    td { padding: 1rem 1.25rem; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; vertical-align: top; }
    .date-cell { color: #64748b; font-size: 0.85rem; white-space: nowrap; }
    .po-num { font-weight: 800; color: #1e293b; }
    .po-date { font-size: 0.75rem; color: #94a3b8; margin-top: 0.1rem; }
    .supplier-cell { font-weight: 600; color: #1e293b; }
    .items-cell { font-size: 0.82rem; color: #475569; max-width: 260px; }
    .po-item-line { margin-bottom: 0.25rem; }
    .total-cell { font-weight: 700; color: #1e293b; }
    .actions-cell { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
    .btn-approve { background: #dcfce7; color: #166534; border: none; padding: 0.3rem 0.7rem; border-radius: 0.5rem; font-size: 0.78rem; font-weight: 700; cursor: pointer; }
    .btn-approve:hover { background: #bbf7d0; }
    .btn-receive { background: #dbeafe; color: #1d4ed8; border: none; padding: 0.3rem 0.7rem; border-radius: 0.5rem; font-size: 0.78rem; font-weight: 700; cursor: pointer; }
    .btn-receive:hover { background: #bfdbfe; }
    .btn-cancel { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 0.3rem 0.6rem; border-radius: 0.5rem; font-size: 0.78rem; font-weight: 700; cursor: pointer; }
    .btn-cancel:hover { background: #fee2e2; }
    .status-final { color: #cbd5e1; font-size: 1rem; }
    .tag-received { background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 800; }
    .tag-cancelled { background: #fef2f2; color: #dc2626; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 800; }
    .tag-approved { background: #fef9c3; color: #854d0e; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 800; }
    .tag-created { background: #eff6ff; color: #1d4ed8; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 800; }
    .empty-state { text-align: center; color: #94a3b8; padding: 3rem; }
  `]
})
export class PurchaseViewComponent {
  @Input() canCreate = true;
  @Input() canApprove = true;
  @Input() canReceive = true;
  @Input() set purchaseOrders(val: any[]) { this._orders = val || []; this.applyFilter(); }
  @Input() suppliers: any[] = [];
  @Input() products: any[] = [];
  @Input() warehouses: any[] = [];
  @Output() addNew = new EventEmitter();
  @Output() statusChange = new EventEmitter<{id: number, status: string}>();

  _orders: any[] = [];
  filtered: any[] = [];
  statusFilter = '';

  applyFilter() {
    this.filtered = this._orders.filter(po => !this.statusFilter || po.status === this.statusFilter);
  }

  getSupplierName(id: any) { return this.suppliers.find(s => s.id?.toString() === id?.toString())?.name || 'Supplier #' + id; }
  getProductName(id: any) { return this.products.find(p => p.id?.toString() === id?.toString())?.name || 'Product #' + id; }
  getWarehouseName(id: any) { return this.warehouses.find(w => w.id?.toString() === id?.toString())?.name || 'Warehouse #' + id; }
}
