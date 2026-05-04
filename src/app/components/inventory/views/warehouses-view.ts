import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-warehouses-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="view-header flex-header">
      <div>
        <h1>Warehouses</h1>
        <p>Track capacity and move stock between locations.</p>
      </div>
      <button *ngIf="canEdit" class="btn-primary" (click)="addNew.emit()">+ New Warehouse</button>
    </header>

    <!-- Warehouse Cards Grid -->
    <div class="wh-grid">
      <div class="wh-card" *ngFor="let w of warehouses">
        <div class="wh-card-top">
          <div>
            <h2 class="wh-name">{{ w.name }}</h2>
            <p class="wh-loc">{{ w.location }}</p>
          </div>
          <span class="tag-active">ACTIVE</span>
        </div>

        <!-- Stats Row -->
        <div class="wh-stats">
          <div class="wh-stat">
            <label>Capacity</label>
            <span>{{ w.capacity || 1000 }}</span>
          </div>
          <div class="wh-stat">
            <label>Total Units</label>
            <span>{{ getWarehouseUnits(w.id) }}</span>
          </div>
          <div class="wh-stat">
            <label>Products</label>
            <span>{{ getWarehouseProductCount(w.id) }}</span>
          </div>
        </div>

        <!-- Action Buttons Row 1 -->
        <div class="wh-actions" *ngIf="canEdit || canMove">
          <button class="btn-action" (click)="edit.emit(w)" *ngIf="canEdit">Edit</button>
          <button class="btn-action danger-outline" (click)="deactivate.emit(w.id)" *ngIf="canEdit">Deactivate</button>
          <button class="btn-action success-outline" (click)="addStock.emit(w)" *ngIf="canMove">Add Stock</button>
        </div>
        <!-- Action Buttons Row 2 -->
        <div class="wh-actions" style="margin-top: 0.5rem;" *ngIf="canMove">
          <button class="btn-action danger-outline" (click)="deduct.emit(w)">Deduct</button>
          <button class="btn-action primary-solid" (click)="transfer.emit(w)">Transfer</button>
        </div>

        <!-- Current Stock List -->
        <div class="wh-stock">
          <div class="stock-header">
            <span>Current Stock</span>
            <span class="stock-count">{{ getWarehouseProductCount(w.id) }} items</span>
          </div>
          <div class="stock-item" *ngFor="let item of getWarehouseInventory(w.id).slice(0,4)">
            <div>
              <div class="stock-name">{{ item.name }}</div>
              <div class="stock-pid">Product #{{ item.id }}</div>
            </div>
            <span class="stock-qty">{{ item.currentStockLevel }}</span>
          </div>
          <div *ngIf="getWarehouseInventory(w.id).length === 0" class="empty-stock">No stock data</div>
        </div>
      </div>
      <div *ngIf="warehouses.length === 0" class="empty-state">No warehouses found. Add your first warehouse!</div>
    </div>
  `,
  styles: [`
    .view-header { margin-bottom: 1.5rem; }
    .view-header h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
    .view-header p { color: #64748b; margin: 0.25rem 0 0; }
    .flex-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .btn-primary { background: #6366f1; color: white; border: none; padding: 0.7rem 1.25rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
    .wh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .wh-card { background: white; border-radius: 1.25rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 1.5rem; }
    .wh-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
    .wh-name { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; }
    .wh-loc { font-size: 0.8rem; color: #94a3b8; margin: 0.2rem 0 0; }
    .tag-active { background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 800; white-space: nowrap; }
    .wh-stats { display: flex; gap: 1.5rem; margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9; }
    .wh-stat { display: flex; flex-direction: column; gap: 0.2rem; }
    .wh-stat label { font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
    .wh-stat span { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
    .wh-actions { display: flex; gap: 0.5rem; }
    .btn-action { flex: 1; padding: 0.5rem; border-radius: 0.6rem; font-size: 0.82rem; font-weight: 700; cursor: pointer; border: 1px solid #e2e8f0; background: white; color: #475569; }
    .btn-action:hover { background: #f8fafc; }
    .btn-action.danger-outline { border-color: #fca5a5; color: #dc2626; }
    .btn-action.danger-outline:hover { background: #fef2f2; }
    .btn-action.success-outline { border-color: #86efac; color: #16a34a; }
    .btn-action.success-outline:hover { background: #f0fdf4; }
    .btn-action.primary-solid { background: #6366f1; color: white; border-color: #6366f1; }
    .btn-action.primary-solid:hover { background: #4f46e5; }
    .wh-stock { margin-top: 1.25rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
    .stock-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.85rem; font-weight: 700; color: #1e293b; }
    .stock-count { font-size: 0.78rem; color: #94a3b8; font-weight: 600; }
    .stock-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #f8fafc; }
    .stock-name { font-size: 0.88rem; font-weight: 600; color: #1e293b; }
    .stock-pid { font-size: 0.72rem; color: #94a3b8; }
    .stock-qty { font-weight: 800; font-size: 1rem; color: #6366f1; }
    .empty-stock { text-align: center; color: #94a3b8; font-size: 0.82rem; padding: 1rem; }
    .empty-state { grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 3rem; background: white; border-radius: 1.25rem; }
  `]
})
export class WarehousesViewComponent {
  @Input() canEdit = true;
  @Input() canMove = true;
  @Input() warehouses: any[] = [];
  @Input() inventory: any[] = [];
  @Input() movements: any[] = [];
  @Input() warehouseInventory: any[] = [];
  @Output() addNew = new EventEmitter();
  @Output() edit = new EventEmitter<any>();
  @Output() deactivate = new EventEmitter<number>();
  @Output() addStock = new EventEmitter<any>();
  @Output() deduct = new EventEmitter<any>();
  @Output() transfer = new EventEmitter<any>();

  getWarehouseInventory(warehouseId: any): any[] {
    const wid = warehouseId?.toString();
    return this.warehouseInventory
      .filter(i => i.warehouseId?.toString() === wid)
      .map(i => {
        const product = this.inventory.find(p => p.id?.toString() === i.productId?.toString());
        return {
          ...product,
          currentStockLevel: i.quantity, // Specific quantity in this warehouse
          id: i.productId
        };
      });
  }

  getWarehouseUnits(warehouseId: any): number {
    return this.getWarehouseInventory(warehouseId).reduce((s, p) => s + (p.currentStockLevel || 0), 0);
  }

  getWarehouseProductCount(warehouseId: any): number {
    return this.getWarehouseInventory(warehouseId).length;
  }
}
