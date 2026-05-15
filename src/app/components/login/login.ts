import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { timeout, TimeoutError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <!-- Error Popup Modal -->
      <div class="modal-overlay" *ngIf="showPopup" (click)="closePopup()">
        <div class="error-card shadow-2xl animate-pop" (click)="$event.stopPropagation()">
          <div class="error-icon">✕</div>
          <h2>Authentication Failed</h2>
          <p>{{ error }}</p>
          <button class="btn-retry" (click)="closePopup()">Try Again</button>
        </div>
      </div>

      <div class="auth-card shadow-2xl" [class.shake]="shakeCard">
        <div class="logo-area">
          <span class="logo-icon">📦</span>
          <h2>Welcome Back</h2>
        </div>
        <p class="subtitle">Enter your credentials to access the command center</p>
        
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Email Address</label>
            <div class="input-wrapper">
              <span class="input-icon">✉️</span>
              <input type="email" [(ngModel)]="credentials.email" name="email" required placeholder="john@example.com">
            </div>
          </div>
          
          <div class="form-group">
            <label>Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input type="password" [(ngModel)]="credentials.password" name="password" required placeholder="••••••••">
            </div>
          </div>

          <button type="submit" class="btn-primary">
            Sign In
          </button>
        </form>

        <div class="auth-footer">
          <p>New to StockPro? <a (click)="goToRegister()">Create an account</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); font-family: 'Inter', sans-serif; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .error-card { background: white; padding: 2.5rem; border-radius: 1.5rem; text-align: center; width: 90%; max-width: 380px; border: 4px solid #feb2b2; }
    .error-icon { width: 60px; height: 60px; background: #feb2b2; color: #c53030; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem; font-weight: bold; }
    .error-card h2 { color: #2d3748; margin-bottom: 0.5rem; font-weight: 800; }
    .error-card p { color: #4a5568; margin-bottom: 1.5rem; font-size: 1rem; line-height: 1.5; }
    .btn-retry { background: #c53030; color: white; border: none; padding: 1rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; width: 100%; transition: opacity 0.2s; font-size: 1rem; }
    .btn-retry:hover { opacity: 0.9; }
    .auth-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); padding: 3rem; border-radius: 2rem; width: 100%; max-width: 420px; border: 1px solid rgba(255, 255, 255, 0.1); color: white; }
    .logo-area { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1rem; }
    .logo-icon { font-size: 2.5rem; }
    .subtitle { color: #a0aec0; text-align: center; margin-bottom: 2.5rem; font-size: 0.95rem; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; color: #cbd5e0; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .input-wrapper { position: relative; }
    .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #718096; }
    input { width: 100%; padding: 1rem 1rem 1rem 3rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1rem; color: white; font-size: 1rem; box-sizing: border-box; }
    input:focus { outline: none; border-color: #667eea; background: rgba(255, 255, 255, 0.15); box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2); }
    input::placeholder { color: #718096; }
    .btn-primary { width: 100%; padding: 1rem; background: #667eea; color: white; border: none; border-radius: 1rem; font-size: 1.1rem; font-weight: 700; cursor: pointer; margin-top: 1rem; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { background: #5a67d8; transform: translateY(-2px); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .auth-footer { margin-top: 2rem; text-align: center; font-size: 0.9rem; color: #a0aec0; }
    .auth-footer a { color: #667eea; font-weight: 700; cursor: pointer; text-decoration: none; }
    .animate-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes pop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
    @keyframes shake { 10%, 90% { transform: translate3d(-2px, 0, 0); } 20%, 80% { transform: translate3d(3px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-5px, 0, 0); } 40%, 60% { transform: translate3d(5px, 0, 0); } }
  `]
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  loading = false;
  error = '';
  showPopup = false;
  shakeCard = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Already logged in? Skip login page and go directly to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/inventory']);
    }
  }

  onLogin() {
    if (!this.credentials.email || !this.credentials.password) {
      this.triggerError('Please enter both email and password.');
      return;
    }

    this.loading = true;
    this.showPopup = false;
    this.shakeCard = false;
    this.error = '';

    this.authService.login(this.credentials).pipe(
      timeout(10000) // 10 second timeout
    ).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.router.navigate(['/inventory']);
      },
      error: (err: any) => {
        let msg = 'Invalid email or password.';
        if (err instanceof TimeoutError || err.name === 'TimeoutError') {
          msg = 'Server is taking too long. Please check if all services are running.';
        } else if (err.status === 0) {
          msg = 'Cannot connect to server. Is the Gateway running on port 8080?';
        } else if (err.error && typeof err.error === 'string') {
          msg = err.error;
        }
        this.triggerError(msg);
      }
    });
  }

  triggerError(msg: string) {
    this.loading = false;
    this.error = msg;
    this.showPopup = true;
    this.shakeCard = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.shakeCard = false;
      this.cdr.detectChanges();
    }, 600);
  }

  closePopup() {
    this.showPopup = false;
    this.cdr.detectChanges();
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
