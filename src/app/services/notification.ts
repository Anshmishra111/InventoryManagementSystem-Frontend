import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, shareReplay, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private alertsUrl = '/api/dashboard/alerts';

  // Automatically refresh alerts every 30 seconds
  public alerts$: Observable<any[]> = timer(0, 30000).pipe(
    switchMap(() => this.http.get<any[]>(this.alertsUrl)),
    catchError(() => []),
    shareReplay(1)
  );

  constructor(private http: HttpClient) { }

  getAlerts(): Observable<any[]> {
    return this.http.get<any[]>(this.alertsUrl);
  }
}
