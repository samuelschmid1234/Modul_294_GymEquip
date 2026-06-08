import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AccessorySet } from '../models/accessory-set.model';

@Injectable({ providedIn: 'root' })
export class AccessorySetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.backendBaseUrl}/api/accessory-sets`;

  getAll(): Observable<AccessorySet[]> {
    return this.http.get<AccessorySet[]>(this.baseUrl);
  }

  getById(id: number): Observable<AccessorySet> {
    return this.http.get<AccessorySet>(`${this.baseUrl}/${id}`);
  }

  create(accessorySet: AccessorySet): Observable<AccessorySet> {
    return this.http.post<AccessorySet>(this.baseUrl, accessorySet);
  }

  update(id: number, accessorySet: AccessorySet): Observable<AccessorySet> {
    return this.http.put<AccessorySet>(`${this.baseUrl}/${id}`, accessorySet);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
