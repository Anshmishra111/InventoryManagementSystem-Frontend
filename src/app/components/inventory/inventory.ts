import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InventoryService } from '../../services/inventory';
import { AuthService } from '../../services/auth';
import { NavigationService, DashboardView } from '../../services/navigation';
import { NotificationService } from '../../services/notification';
import { DashboardViewComponent } from './views/dashboard-view';
import { ProductsViewComponent } from './views/products-view';
import { MovementsViewComponent } from './views/movements-view';
import { AlertsViewComponent } from './views/alerts-view';
import { ReportsViewComponent } from './views/reports-view';
import { SuppliersViewComponent } from './views/suppliers-view';
import { PurchaseViewComponent } from './views/purchase-view';
import { WarehousesViewComponent } from './views/warehouses-view';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardViewComponent, ProductsViewComponent, MovementsViewComponent, AlertsViewComponent, ReportsViewComponent, SuppliersViewComponent, PurchaseViewComponent, WarehousesViewComponent],
  template: `
    <div class="unified-dashboard">
      <header class="top-nav">
        <div class="nav-left">
          <span class="page-title">{{ getActiveLabel() }}</span>
        </div>
        <div class="nav-actions">
          <div class="notification-bell" (click)="toggleAlerts($event)">
            <span class="bell-icon">🔔</span>
            <span class="badge" *ngIf="activeAlerts.length > 0">{{ activeAlerts.length }}</span>
            <div class="alerts-dropdown" *ngIf="showAlerts" (click)="$event.stopPropagation()">
              <div class="dropdown-header"><h4>Alerts</h4><span>{{ activeAlerts.length }} New</span></div>
              <div class="dropdown-body">
                <div class="drop-alert-item" *ngFor="let a of activeAlerts.slice(0,4)">
                  <span class="tag-low-sm">LOW</span>
                  <p>{{ a.alertMessage || 'Product #' + a.productId }}</p>
                </div>
                <div *ngIf="activeAlerts.length === 0" class="drop-empty">✅ No alerts</div>
              </div>
            </div>
          </div>
          <div class="user-profile">
            <div class="avatar-sm">HM</div>
            <div class="user-info">
              <span class="user-name">Himanshu Mishra</span>
            </div>
          </div>
        </div>
      </header>

      <!-- MODAL for add/edit -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ getModalTitle() }}</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <form (ngSubmit)="saveData()" class="modal-body">
            <ng-container *ngIf="modalView === 'products'">
              <div class="form-row">
                <div class="form-group"><label>Product Name *</label><input type="text" [(ngModel)]="formData.name" name="name" required></div>
                <div class="form-group"><label>SKU</label><input type="text" [(ngModel)]="formData.sku" name="sku"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Selling Price</label><input type="number" [(ngModel)]="formData.sellingPrice" name="sp"></div>
                <div class="form-group"><label>Cost Price</label><input type="number" [(ngModel)]="formData.costPrice" name="cp"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Stock</label><input type="number" [(ngModel)]="formData.currentStockLevel" name="stock"></div>
                <div class="form-group"><label>Reorder Level</label><input type="number" [(ngModel)]="formData.reorderLevel" name="rl"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Barcode</label><input type="text" [(ngModel)]="formData.barcode" name="barcode"></div>
                <div class="form-group"><label>Category</label><input type="text" [(ngModel)]="formData.category" name="cat"></div>
              </div>
            </ng-container>
            <ng-container *ngIf="modalView === 'warehouses'">
              <div class="form-group"><label>Warehouse Name *</label><input type="text" [(ngModel)]="formData.name" name="wn" required></div>
              <div class="form-group" style="margin-top:1rem"><label>Location *</label><input type="text" [(ngModel)]="formData.location" name="wl" required></div>
            </ng-container>
            <ng-container *ngIf="modalView === 'suppliers'">
              <div class="form-row">
                <div class="form-group"><label>Supplier Name *</label><input type="text" [(ngModel)]="formData.name" name="sn" required></div>
                <div class="form-group"><label>Contact Person</label><input type="text" [(ngModel)]="formData.contactPerson" name="scp"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Email *</label><input type="email" [(ngModel)]="formData.email" name="se" required></div>
                <div class="form-group"><label>Phone</label><input type="text" [(ngModel)]="formData.phone" name="sph"></div>
              </div>
              <div class="form-group" style="margin-top:0.5rem"><label>Address</label><input type="text" [(ngModel)]="formData.address" name="sadr"></div>
            </ng-container>
            <ng-container *ngIf="modalView === 'purchase'">
              <div class="form-group">
                <label>Select Supplier *</label>
                <select [(ngModel)]="formData.supplierId" name="ps" required class="form-select">
                  <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div class="form-group" style="margin-top:1rem">
                <label>Select Product *</label>
                <select [(ngModel)]="formData.productId" (change)="onProductSelect()" name="pp" required class="form-select">
                  <option *ngFor="let p of inventory" [value]="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div class="form-row" style="margin-top:1rem">
                <div class="form-group"><label>Quantity *</label><input type="number" [(ngModel)]="formData.quantity" name="pq" required min="1"></div>
                <div class="form-group"><label>Unit Price (₹) *</label><input type="number" [(ngModel)]="formData.unitPrice" name="pup" required min="0" step="0.01"></div>
              </div>
            </ng-container>
            <ng-container *ngIf="modalView === 'sales'">
              <div class="form-group">
                <label>Select Product *</label>
                <select [(ngModel)]="formData.productId" name="slp" required class="form-select">
                  <option *ngFor="let p of inventory" [value]="p.id">{{ p.name }} (Qty: {{ p.currentStockLevel }})</option>
                </select>
              </div>
              <div class="form-group" style="margin-top:1rem">
                <label>Select Warehouse *</label>
                <select [(ngModel)]="formData.warehouseId" name="slw" required class="form-select">
                  <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }} ({{ w.location }})</option>
                </select>
              </div>
              <div class="form-row" style="margin-top:1rem">
                <div class="form-group"><label>Quantity *</label><input type="number" [(ngModel)]="formData.quantity" name="slq" required min="1"></div>
                <div class="form-group"><label>Customer Name</label><input type="text" [(ngModel)]="formData.customerName" name="slc"></div>
              </div>
              <div class="form-row" style="margin-top:1rem">
                <div class="form-group"><label>Customer Email</label><input type="email" [(ngModel)]="formData.customerEmail" name="sle"></div>
                <div class="form-group"><label>Customer Phone</label><input type="text" [(ngModel)]="formData.customerPhone" name="slph"></div>
              </div>
            </ng-container>
            <ng-container *ngIf="modalView === 'movements'">
              <div class="form-group">
                <label>Movement Type *</label>
                <select [(ngModel)]="formData.type" name="mvtype" required class="form-select">
                  <option value="IN">Stock In (Add Stock)</option>
                  <option value="OUT">Stock Out (Remove Stock)</option>
                  <option value="INTERNAL">Internal Transfer</option>
                </select>
              </div>
              <div class="form-group" style="margin-top:1rem">
                <label>Select Product *</label>
                <select [(ngModel)]="formData.productId" name="mvp" required class="form-select">
                  <option *ngFor="let p of inventory" [value]="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div class="form-group" style="margin-top:1rem">
                <label>Warehouse *</label>
                <select [(ngModel)]="formData.warehouseId" name="mvw" required class="form-select">
                  <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</option>
                </select>
              </div>
              <div class="form-group" style="margin-top:1rem" *ngIf="formData.type === 'INTERNAL'">
                <label>To Warehouse *</label>
                <select [(ngModel)]="formData.toWarehouseId" name="mvtow" required class="form-select">
                  <option *ngFor="let w of warehouses" [value]="w.id" [disabled]="w.id == formData.warehouseId">{{ w.name }}</option>
                </select>
              </div>
              <div class="form-row" style="margin-top:1rem">
                <div class="form-group"><label>Quantity *</label><input type="number" [(ngModel)]="formData.quantity" name="mvq" required min="1"></div>
                <div class="form-group"><label>Reference ID</label><input type="number" [(ngModel)]="formData.referenceId" name="mvr_id" placeholder="e.g. 101"></div>
              </div>
              <div class="form-row" style="margin-top:1rem">
                <div class="form-group"><label>Reference Type</label><input type="text" [(ngModel)]="formData.referenceType" name="mvr_type" placeholder="e.g. INVOICE"></div>
                <div class="form-group"><label>Notes (Optional)</label><input type="text" [(ngModel)]="formData.reason" name="mvr_notes" placeholder="Additional details"></div>
              </div>
            </ng-container>
            <ng-container *ngIf="modalView === 'users'">
              <div class="form-group"><label>Full Name</label><input type="text" [(ngModel)]="formData.fullName" name="ufn"></div>
              <div class="form-row" style="margin-top:1rem">
                <div class="form-group">
                  <label>Role</label>
                  <select [(ngModel)]="formData.role" name="urole" class="form-select">
                    <option value="ADMIN">ADMIN</option>
                    <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
                    <option value="WAREHOUSE_STAFF">WAREHOUSE_STAFF</option>
                    <option value="PURCHASE_OFFICER">PURCHASE_OFFICER</option>
                  </select>
                </div>
                <div class="form-group"><label>Department</label><input type="text" [(ngModel)]="formData.department" name="udep"></div>
              </div>
              <div class="form-group" style="margin-top:1rem; flex-direction:row; align-items:center; gap:0.5rem">
                <input type="checkbox" [(ngModel)]="formData.active" name="uact" style="width:auto">
                <label>Account Active</label>
              </div>
            </ng-container>
            <ng-container *ngIf="modalView === 'receive-po'">
              <p style="margin-bottom:1rem; color:#475569;">You are receiving Purchase Order #{{ formData.poId }}.</p>
              <div class="form-group">
                <label>Select Destination Warehouse *</label>
                <select [(ngModel)]="formData.warehouseId" name="mvw" required class="form-select">
                  <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</option>
                </select>
              </div>
            </ng-container>
            <ng-container *ngIf="modalView === 'fulfill-so'">
              <p style="margin-bottom:1rem; color:#475569;">You are fulfilling Sales Order #{{ currentPOId }}.</p>
              <div class="form-group">
                <label>Select Source Warehouse *</label>
                <select [(ngModel)]="formData.warehouseId" name="so_mvw" required class="form-select">
                  <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</option>
                </select>
              </div>
            </ng-container>
            <div *ngIf="error" class="error-box">{{ error }}</div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="loading">{{ loading ? 'Saving...' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Content -->
      <div class="content-viewport">
        <app-dashboard-view *ngIf="activeView === 'dashboard'"
          [inventory]="inventory" [warehouses]="warehouses" [alerts]="activeAlerts" [purchaseOrders]="purchaseOrders">
        </app-dashboard-view>

        <app-products-view *ngIf="activeView === 'products'"
          [products]="inventory"
          [canEdit]="canShow(['ADMIN', 'INVENTORY_MANAGER'])"
          (addNew)="openModal()"
          (edit)="openModal($event)"
          (deactivate)="deactivateProduct($event)"
          (activate)="activateProduct($event)">
        </app-products-view>

        <app-movements-view *ngIf="activeView === 'movements'"
          [movements]="movements" [products]="inventory" [warehouses]="warehouses">
        </app-movements-view>

        <app-alerts-view *ngIf="activeView === 'alerts'" [alerts]="activeAlerts"></app-alerts-view>

        <app-reports-view *ngIf="activeView === 'reports'" [inventory]="inventory"></app-reports-view>

        <!-- Warehouses (rich card view) -->
        <app-warehouses-view *ngIf="activeView === 'warehouses'"
          [warehouses]="warehouses" [inventory]="inventory" [movements]="movements" [warehouseInventory]="warehouseInventory"
          (addNew)="openModal()"
          (edit)="openModal($event)"
          (deactivate)="deleteWarehouse($event)"
          (addStock)="openAddStockModal($event)"
          (deduct)="openDeductModal($event)"
          (transfer)="openTransferModal($event)"
          [canEdit]="canShow(['ADMIN', 'INVENTORY_MANAGER'])"
          [canMove]="canShow(['ADMIN', 'WAREHOUSE_STAFF'])">
        </app-warehouses-view>

        <!-- Suppliers (rich table view) -->
        <app-suppliers-view *ngIf="activeView === 'suppliers'"
          [suppliers]="suppliers"
          (addNew)="openModal()"
          (edit)="openModal($event)"
          (deactivate)="deactivateSupplier($event)"
          (activate)="activateSupplier($event)">
        </app-suppliers-view>

        <!-- Purchase Orders (rich table view) -->
        <app-purchase-view *ngIf="activeView === 'purchase'"
          [purchaseOrders]="purchaseOrders"
          [suppliers]="suppliers"
          [products]="inventory"
          [warehouses]="warehouses"
          [canCreate]="canShow(['ADMIN', 'PURCHASE_OFFICER'])"
          [canApprove]="canShow(['ADMIN', 'INVENTORY_MANAGER', 'PURCHASE_OFFICER'])"
          [canReceive]="canShow(['ADMIN', 'WAREHOUSE_STAFF'])"
          (addNew)="openModal()"
          (statusChange)="updatePOStatus($event.id, $event.status)">
        </app-purchase-view>

        <!-- Sales Orders -->
        <ng-container *ngIf="activeView === 'sales'">
          <header class="view-header flex-header">
            <div><h1>Sales Orders</h1><p>Customer transactions</p></div>
            <button *ngIf="canShow(['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'])" class="btn-primary" (click)="openModal()">+ New Order</button>
          </header>
          <div class="card table-card">
            <table><thead><tr><th>Customer</th><th>Product</th><th>Warehouse</th><th>Qty</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let o of orders">
                <td class="bold-cell">
                  <div>{{ o.customerName || 'Walk-in' }}</div>
                  <div style="font-size: 0.7rem; color: #64748b; font-weight: 400;">
                    {{ o.customerPhone }} {{ o.customerPhone && o.customerEmail ? '|' : '' }} {{ o.customerEmail }}
                  </div>
                </td>
                <td>{{ getProductName(o.items?.[0]?.productId || o.productId) }}</td>
                <td>{{ getWarehouseName(o.warehouseId) }}</td>
                <td class="text-danger">-{{ o.items?.[0]?.quantity || o.quantity }}</td>
                <td>
                  <span [class.tag-pending]="o.status === 'PENDING'" [class.tag-ok]="o.status === 'COMPLETED'">
                    {{ o.status || 'PENDING' }}
                  </span>
                </td>
                <td class="action-cells">
                  <button *ngIf="(!o.status || o.status === 'PENDING') && canShow(['ADMIN', 'WAREHOUSE_STAFF'])" class="btn-small btn-primary" (click)="fulfillSO(o.id)">📦 Fulfill</button>
                </td>
              </tr>
            </tbody></table>
          </div>
        </ng-container>

        <!-- User Management (Admin Only) -->
        <ng-container *ngIf="activeView === 'users'">
          <header class="view-header flex-header">
            <div><h1>User Management</h1><p>Manage system users and roles</p></div>
          </header>
          <div class="card table-card">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of users">
                  <td class="bold-cell">{{ u.fullName }}</td>
                  <td>{{ u.email }}</td>
                  <td><span class="role-badge">{{ u.role }}</span></td>
                  <td>{{ u.department || '-' }}</td>
                  <td>
                    <span [class.tag-ok]="u.active" [class.tag-pending]="!u.active">
                      {{ u.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="action-cells">
                    <button class="btn-icon" (click)="openUserEdit(u)">✏️</button>
                    <button class="btn-icon text-danger" (click)="deleteUser(u.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .unified-dashboard { background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .top-nav { height: 60px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; position: sticky; top: 0; z-index: 100; }
    .nav-left { display: flex; align-items: center; gap: 2rem; }
    .page-title { font-weight: 700; color: #1e293b; font-size: 1rem; }
    .nav-actions { display: flex; align-items: center; gap: 1.5rem; }
    .notification-bell { position: relative; cursor: pointer; }
    .bell-icon { font-size: 1.3rem; }
    .badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; font-size: 0.6rem; padding: 0.15rem 0.35rem; border-radius: 50%; font-weight: 800; }
    .alerts-dropdown { position: absolute; top: 120%; right: 0; width: 300px; background: white; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); border: 1px solid #f1f5f9; z-index: 200; }
    .dropdown-header { padding: 1rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-weight: 700; font-size: 0.9rem; }
    .drop-alert-item { display: flex; gap: 0.5rem; padding: 0.75rem 1rem; border-bottom: 1px solid #f8fafc; align-items: flex-start; }
    .drop-alert-item p { margin: 0; font-size: 0.8rem; color: #475569; }
    .tag-low-sm { background: #fef2f2; color: #dc2626; padding: 0.15rem 0.4rem; border-radius: 0.3rem; font-size: 0.6rem; font-weight: 800; white-space: nowrap; }
    .drop-empty { padding: 1rem; text-align: center; color: #94a3b8; font-size: 0.85rem; }
    .user-profile { display: flex; align-items: center; gap: 0.75rem; }
    .avatar-sm { width: 36px; height: 36px; background: #6366f1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    .user-name { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
    .content-viewport { padding: 2rem; }
    .view-header { margin-bottom: 1.5rem; }
    .view-header h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
    .view-header p { color: #64748b; margin: 0.25rem 0 0; }
    .flex-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .card { background: white; border-radius: 1.25rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .table-card { overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem 1.25rem; font-size: 0.78rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; font-weight: 700; }
    td { padding: 1rem 1.25rem; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; }
    .bold-cell { font-weight: 700; color: #1e293b; }
    .text-success { color: #16a34a; font-weight: 700; }
    .text-danger { color: #dc2626; font-weight: 700; }
    .btn-primary { background: #6366f1; color: white; border: none; padding: 0.7rem 1.25rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
    .btn-secondary { background: #f1f5f9; color: #475569; border: none; padding: 0.7rem 1.25rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }
    .btn-icon { background: none; border: 1px solid #e2e8f0; padding: 0.35rem 0.6rem; border-radius: 0.5rem; cursor: pointer; margin-right: 0.25rem; }
    .tag-ok { background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.72rem; font-weight: 800; }
    .error-box { background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; margin: 1rem 0; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
    .modal-card { background: white; padding: 2rem; border-radius: 1.25rem; width: 100%; max-width: 560px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-header h3 { font-size: 1.25rem; font-weight: 800; margin: 0; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
    .modal-body { display: flex; flex-direction: column; gap: 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group label { font-size: 0.8rem; font-weight: 700; color: #64748b; }
    .form-group input, .form-select { padding: 0.65rem 0.9rem; border: 2px solid #f1f5f9; border-radius: 0.6rem; font-size: 0.9rem; }
    .form-group input:focus, .form-select:focus { outline: none; border-color: #6366f1; }
    .role-badge { background: #e0e7ff; color: #4338ca; font-size: 0.65rem; padding: 0.15rem 0.5rem; border-radius: 0.25rem; font-weight: 800; }
    .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
  `]
})
export class InventoryComponent implements OnInit {
  canShow(roles: string[]): boolean {
    return roles.includes(this.authService.getRole());
  }

  activeView: DashboardView = 'dashboard';
  modalView: DashboardView = 'dashboard';
  inventory: any[] = [];
  warehouses: any[] = [];
  suppliers: any[] = [];
  orders: any[] = [];
  purchaseOrders: any[] = [];
  movements: any[] = [];
  warehouseInventory: any[] = [];
  users: any[] = [];
  activeAlerts: any[] = [];
  showAlerts = false;
  showModal = false;
  isEdit = false;
  loading = false;
  error = '';
  apiError = '';
  currentPOId = 0;
  formData: any = {};

  constructor(
    public authService: AuthService,
    private inventoryService: InventoryService,
    private http: HttpClient,
    private navService: NavigationService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.navService.currentView$.subscribe(view => { this.activeView = view; this.loadAllData(); });
    this.notificationService.alerts$.subscribe(a => { this.activeAlerts = a || []; this.cdr.detectChanges(); });
  }

  ngOnInit() {
    this.loadAllData();
    window.addEventListener('click', () => { this.showAlerts = false; this.cdr.detectChanges(); });
  }

  loadAllData() {
    const fork = () => {
      if (this.inventory.length > 0 && this.warehouseInventory.length > 0) {
        this.inventory.forEach(p => {
          const total = this.warehouseInventory
            .filter(wi => wi.productId?.toString() === p.id?.toString())
            .reduce((sum, wi) => sum + (wi.quantity || 0), 0);
          p.currentStockLevel = total;
        });
        this.cdr.detectChanges();
      }
    };

    this.inventoryService.getInventory().subscribe(d => { this.inventory = d || []; fork(); });
    this.http.get<any[]>('/api/dashboard/warehouse').subscribe(d => { this.warehouses = d || []; this.cdr.detectChanges(); });
    this.http.get<any[]>('/api/dashboard/suppliers').subscribe(d => { this.suppliers = d || []; this.cdr.detectChanges(); });
    this.http.get<any[]>('/api/dashboard/sales/orders').subscribe(d => { this.orders = d || []; this.cdr.detectChanges(); });
    this.http.get<any[]>('/api/dashboard/purchase/orders').subscribe(d => { this.purchaseOrders = d || []; this.cdr.detectChanges(); });
    this.http.get<any[]>('/api/dashboard/movements').subscribe(d => { this.movements = d || []; this.cdr.detectChanges(); });
    this.http.get<any[]>('/api/dashboard/movements/inventory').subscribe(d => { this.warehouseInventory = d || []; fork(); });
    
    if (this.authService.getRole() === 'ADMIN') {
      this.http.get<any[]>('/api/dashboard/admin/users').subscribe(d => { this.users = d || []; this.cdr.detectChanges(); });
    }
  }

  getActiveLabel() {
    const labels: Record<DashboardView, string> = {
      dashboard: 'Dashboard', products: 'Products', warehouses: 'Warehouses',
      suppliers: 'Suppliers', sales: 'Sales', purchase: 'Purchase Orders',
      movements: 'Movements', reports: 'Reports', alerts: 'Alerts', 
      'receive-po': 'Receive PO', 'fulfill-so': 'Fulfill SO', users: 'User Management'
    };
    return labels[this.activeView] || 'Dashboard';
  }

  getModalLabel() {
    const l: Partial<Record<DashboardView, string>> = { products: 'Product', warehouses: 'Warehouse', suppliers: 'Supplier', purchase: 'Purchase Order', sales: 'Sales Order', movements: 'Stock Movement' };
    return l[this.modalView] || '';
  }

  getModalTitle() {
    if (this.modalView === 'movements') {
      if (this.formData.type === 'OUT') return 'Deduct Stock';
      if (this.formData.type === 'IN') return 'Add Stock';
      if (this.formData.type === 'INTERNAL') return 'Transfer Stock';
      return 'Stock Movement';
    }
    return (this.isEdit ? 'Edit ' : 'Add New ') + this.getModalLabel();
  }

  getProductName(id: any) { return this.inventory.find(p => p.id?.toString() === id?.toString())?.name || 'Product #' + id; }
  getWarehouseName(id: any) { return this.warehouses.find(w => w.id?.toString() === id?.toString())?.name || (id ? 'Warehouse #' + id : '-'); }

  onProductSelect() {
    const product = this.inventory.find(p => p.id?.toString() === this.formData.productId?.toString());
    if (product && this.modalView === 'purchase') {
      this.formData.unitPrice = product.costPrice;
    }
    this.cdr.detectChanges();
  }

  toggleAlerts(e: Event) { e.stopPropagation(); this.showAlerts = !this.showAlerts; this.cdr.detectChanges(); }

  openModal(item?: any) {
    this.isEdit = !!item;
    this.error = '';
    this.modalView = this.activeView;
    if (this.modalView === 'warehouses') this.formData = item ? { ...item } : { name: '', location: '' };
    else if (this.modalView === 'suppliers') this.formData = item ? { ...item } : { name: '', email: '' };
    else if (this.modalView === 'purchase') this.formData = { productId: '', supplierId: '', quantity: 1, unitPrice: 0 };
    else if (this.modalView === 'sales') this.formData = { productId: '', warehouseId: '', quantity: 1, customerName: '', customerEmail: '', customerPhone: '' };
    else if (this.modalView === 'movements') this.formData = { productId: '', warehouseId: '', quantity: 1, type: 'IN', referenceId: null, referenceType: 'MANUAL', reason: 'Manual stock addition' };
    else this.formData = item ? { ...item } : { name: '', sku: '', sellingPrice: 0, costPrice: 0, currentStockLevel: 0, reorderLevel: 10, barcode: '', category: '' };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() { this.showModal = false; this.error = ''; this.cdr.detectChanges(); }

  saveData() {
    this.loading = true;
    let url = '/api/dashboard/inventory';
    if (this.modalView === 'warehouses') url = '/api/dashboard/warehouse';
    else if (this.modalView === 'suppliers') url = '/api/dashboard/suppliers';
    else if (this.modalView === 'sales') url = '/api/dashboard/sales/orders';
    else if (this.modalView === 'purchase') url = '/api/dashboard/purchase/orders';
    else if (this.modalView === 'movements') url = '/api/dashboard/movements';
    else if (this.modalView === 'users') url = '/api/dashboard/admin/users';

    // Build correct payload for Purchase Orders
    if (this.modalView === 'receive-po') {
      this.http.post(`/api/dashboard/purchase/orders/${this.formData.poId}/receive?warehouseId=${this.formData.warehouseId}`, {}).subscribe({
        next: () => { this.loading = false; this.closeModal(); this.loadAllData(); },
        error: (e) => { this.loading = false; this.error = e.error?.message || e.error || 'Failed to receive PO.'; this.cdr.detectChanges(); }
      });
      return;
    }

    if (this.modalView === 'fulfill-so') {
      this.http.post(`/api/dashboard/sales/orders/${this.currentPOId}/fulfill?warehouseId=${this.formData.warehouseId}`, {}).subscribe({
        next: () => { this.loading = false; this.closeModal(); this.loadAllData(); },
        error: (e) => { this.loading = false; this.error = e.error?.message || e.error || 'Failed to fulfill SO.'; this.cdr.detectChanges(); }
      });
      return;
    }

    let payload = this.formData;
    if (this.modalView === 'purchase' && !this.isEdit) {
      payload = {
        supplierId: Number(this.formData.supplierId),
        items: [{
          productId: Number(this.formData.productId),
          quantity: Number(this.formData.quantity),
          unitPrice: Number(this.formData.unitPrice)
        }]
      };
    }

    const req = this.isEdit
      ? this.http.put(`${url}/${this.formData.id}`, payload)
      : this.http.post(url, payload);
    req.subscribe({
      next: (result: any) => {
        // For sales orders: immediately fulfill from selected warehouse
        if (this.modalView === 'sales' && result?.id && this.formData.warehouseId) {
          this.http.post(`/api/dashboard/sales/orders/${result.id}/fulfill?warehouseId=${this.formData.warehouseId}`, {}).subscribe({
            next: () => { this.loading = false; this.closeModal(); this.loadAllData(); },
            error: (e) => { this.loading = false; this.error = e.error?.message || e.error || 'Sale placed but stock deduction failed. Check warehouse stock.'; this.cdr.detectChanges(); }
          });
        } else {
          this.loading = false; this.closeModal(); this.loadAllData();
        }
      },
      error: (e) => { this.loading = false; this.error = e.error?.message || e.error || 'Operation failed.'; this.cdr.detectChanges(); }
    });
  }

  updatePOStatus(id: number, status: string) {
    if (status === 'RECEIVED') {
      const po = this.purchaseOrders.find(p => p.id === id);
      this.isEdit = false;
      this.modalView = 'receive-po';
      this.formData = { poId: id, warehouseId: '' };
      this.showModal = true;
      this.cdr.detectChanges();
      return;
    }
    this.http.post(`/api/dashboard/purchase/orders/${id}/status?status=${status}`, {}).subscribe({
      next: () => this.loadAllData(),
      error: (e) => alert('Status update failed: ' + (e.error || e.message))
    });
  }

  fulfillSO(id: number) {
    this.currentPOId = id; // reuse var
    this.isEdit = false;
    this.modalView = 'fulfill-so';
    this.formData = { warehouseId: '' };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  deactivateProduct(id: number) { this.http.delete(`/api/dashboard/inventory/${id}`).subscribe(() => this.loadAllData()); }
  activateProduct(id: number) { const p = this.inventory.find(x => x.id === id); if(p) { p.active = true; this.http.put(`/api/dashboard/inventory/${id}`, p).subscribe(() => this.loadAllData()); } }
  deleteWarehouse(id: number) { if (confirm('Delete warehouse?')) this.http.delete(`/api/dashboard/warehouse/${id}`).subscribe(() => this.loadAllData()); }
  deleteSupplier(id: number) { if (confirm('Delete supplier?')) this.http.delete(`/api/dashboard/suppliers/${id}`).subscribe(() => this.loadAllData()); }
  deactivateSupplier(id: number) { const s = this.suppliers.find(x => x.id === id); if(s) { s.active = false; this.http.put(`/api/dashboard/suppliers/${id}`, s).subscribe(() => this.loadAllData()); } }
  activateSupplier(id: number) { const s = this.suppliers.find(x => x.id === id); if(s) { s.active = true; this.http.put(`/api/dashboard/suppliers/${id}`, s).subscribe(() => this.loadAllData()); } }
  openAddStockModal(warehouse: any) {
    this.isEdit = false;
    this.modalView = 'movements';
    this.formData = { productId: '', warehouseId: warehouse.id, quantity: 1, type: 'IN', referenceId: null, referenceType: 'MANUAL', notes: 'Manual stock addition' };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openDeductModal(warehouse: any) {
    this.isEdit = false;
    this.modalView = 'movements';
    this.formData = { productId: '', warehouseId: warehouse.id, quantity: 1, type: 'OUT', referenceId: null, referenceType: 'MANUAL', notes: 'Manual stock deduction' };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openTransferModal(warehouse: any) {
    this.isEdit = false;
    this.modalView = 'movements';
    this.formData = { productId: '', warehouseId: warehouse.id, quantity: 1, type: 'INTERNAL', referenceId: null, referenceType: 'TRANSFER', notes: 'Transfer from ' + warehouse.name };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openUserEdit(user: any) {
    this.isEdit = true;
    this.modalView = 'users';
    this.formData = { ...user };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`/api/dashboard/admin/users/${id}`).subscribe(() => this.loadAllData());
    }
  }
}
