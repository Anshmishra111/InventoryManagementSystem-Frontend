import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let apiReq = req;
  
  // If the request is to our /api, prepend the full base URL from environment
  if (req.url.startsWith('/api')) {
    apiReq = req.clone({
      url: `${environment.apiUrl}${req.url.replace('/api', '')}`
    });
  }

  if (token) {
    apiReq = apiReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(apiReq);
};
