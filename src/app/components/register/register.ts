import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { timeout, TimeoutError } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">

      <!-- ERROR POPUP MODAL -->
      <div class="modal-overlay" *ngIf="showPopup" (click)="closePopup()">
        <div class="error-card shadow-2xl animate-pop" (click)="$event.stopPropagation()">
          <div class="error-icon">✕</div>
          <h2>Registration Failed</h2>
          <p>{{ error }}</p>
          <button class="btn-retry" (click)="closePopup()">Try Again</button>
        </div>
      </div>

      <!-- SUCCESS OVERLAY -->
      <div *ngIf="success" class="success-overlay">
        <div class="success-card shadow-2xl">
          <div class="check-icon">✓</div>
          <h2>Account Created!</h2>
          <p>Redirecting you to login...</p>
        </div>
      </div>

      <!-- REGISTER FORM -->
      <div class="auth-card shadow-2xl" *ngIf="!success" [class.shake]="shakeCard">
        <div class="logo-area">
          <span class="logo-icon">📦</span>
          <h2>Join StockPro</h2>
        </div>
        <p class="subtitle">Create your management account</p>

        <form (ngSubmit)="onRegister()">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="user.fullName" name="fullName" required placeholder="e.g. John Doe">
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="user.email" name="email" required placeholder="john@example.com">
          </div>
          <div class="form-group">
            <label>Department</label>
            <input type="text" [(ngModel)]="user.department" name="department" placeholder="e.g. Sales, Engineering">
          </div>
          <div class="form-group">
            <label>Password (Min 8 chars)</label>
            <input type="password" [(ngModel)]="user.password" name="password" required minlength="8" placeholder="••••••••">
          </div>
          <div class="form-group">
            <label>System Role</label>
            <select [(ngModel)]="user.role" name="role" class="form-select">
              <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
              <option value="INVENTORY_MANAGER">Inventory Manager</option>
              <option value="PURCHASE_OFFICER">Purchase Officer</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading">
            <span *ngIf="!loading">Create Account</span>
            <span *ngIf="loading" class="spinner-row">
              <span class="spinner"></span> Creating...
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a (click)="goToLogin()">Login here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
    }

    /* ERROR POPUP */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(8px); }
    .error-card { background: white; padding: 2.5rem; border-radius: 1.5rem; text-align: center; width: 100%; max-width: 380px; }
    .error-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1.2rem; font-weight: 800; }
    .error-card h2 { font-size: 1.4rem; color: #1a202c; margin-bottom: 0.75rem; font-weight: 800; }
    .error-card p { color: #718096; font-size: 0.92rem; margin-bottom: 1.5rem; line-height: 1.6; }
    .btn-retry { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 0.75rem 2rem; border-radius: 0.75rem; cursor: pointer; font-weight: 700; font-size: 0.9rem; }
    .animate-pop { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    /* SUCCESS */
    .success-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; z-index: 100; }
    .success-card { background: white; padding: 3rem; border-radius: 1.5rem; text-align: center; }
    .check-icon { width: 80px; height: 80px; background: #48bb78; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1.5rem; }

    /* FORM CARD */
    .auth-card { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 2.5rem; border-radius: 1.5rem; width: 100%; max-width: 420px; }
    .logo-area { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
    .logo-icon { font-size: 2rem; }
    h2 { font-size: 1.6rem; color: #2d3748; font-weight: 800; margin: 0; }
    .subtitle { color: #718096; margin-bottom: 1.5rem; font-size: 0.9rem; }
    .form-group { text-align: left; margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.3rem; color: #4a5568; font-weight: 600; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.03em; }
    input { width: 100%; padding: 0.75rem; border-radius: 0.6rem; border: 2px solid #e2e8f0; font-size: 0.9rem; box-sizing: border-box; transition: border-color 0.2s; }
    input:focus { outline: none; border-color: #764ba2; }
    .btn-primary { width: 100%; padding: 0.85rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; margin-top: 0.5rem; font-size: 1rem; transition: opacity 0.2s; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .spinner-row { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer { margin-top: 1.5rem; font-size: 0.85rem; text-align: center; color: #718096; }
    .auth-footer a { color: #764ba2; cursor: pointer; font-weight: 700; }
    .form-select { width: 100%; padding: 0.75rem; border-radius: 0.6rem; border: 2px solid #e2e8f0; font-size: 0.9rem; box-sizing: border-box; background: white; }
    .form-select:focus { outline: none; border-color: #764ba2; }
    .shake { animation: shake 0.5s ease-in-out; }
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
  `]
})
export class RegisterComponent {
  user = { fullName: '', email: '', password: '', role: 'WAREHOUSE_STAFF', department: '' };
  loading = false;
  success = false;
  error = '';
  showPopup = false;
  shakeCard = false;

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  onRegister() {
    this.loading = true;
    this.error = '';
    this.showPopup = false;
    this.authService.register(this.user).pipe(
      timeout(10000)  // 10 second timeout — shows popup immediately if server is slow
    ).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.cdr.detectChanges(); // Show success screen immediately
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        let msg = '';
        // Try to extract message from various response formats
        if (err.error) {
          if (typeof err.error === 'string' && err.error.length > 0) {
            msg = err.error;
          } else if (err.error?.message) {
            msg = err.error.message;
          }
        }

        if (err instanceof TimeoutError || err.name === 'TimeoutError') {
          this.error = 'Server is taking too long to respond. Please check if all services are running.';
        } else if (err.status === 0) {
          this.error = 'Cannot connect to server. Make sure all services are running.';
        } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('registered')) {
          this.error = 'This email is already registered! Please use a different email or click "Login here".';
        } else if (msg.length > 0) {
          this.error = msg.replace('Error: ', '');
        } else {
          this.error = 'Registration failed. This email may already be registered. Try logging in instead.';
        }

        this.showPopup = true;
        this.shakeCard = true;
        this.cdr.detectChanges(); // Force Angular to render popup immediately
        setTimeout(() => { this.shakeCard = false; this.cdr.detectChanges(); }, 600);
      }
    });
  }

  closePopup() { this.showPopup = false; this.cdr.detectChanges(); }
  goToLogin() { this.router.navigate(['/login']); }
}
