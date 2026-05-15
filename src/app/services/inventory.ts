import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = '/api/dashboard/inventory';

  constructor(private http: HttpClient) { }

  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
