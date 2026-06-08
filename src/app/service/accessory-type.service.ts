import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AccessoryType } from '../models/accessory-type.model';

@Injectable({ providedIn: 'root' })
export class AccessoryTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.backendBaseUrl}/api/accessory-types`;

  getAll(): Observable<AccessoryType[]> {
    return this.http.get<AccessoryType[]>(this.baseUrl);
  }

  getById(id: number): Observable<AccessoryType> {
    return this.http.get<AccessoryType>(`${this.baseUrl}/${id}`);
  }

  create(accessoryType: AccessoryType): Observable<AccessoryType> {
    return this.http.post<AccessoryType>(this.baseUrl, accessoryType);
  }

  update(id: number, accessoryType: AccessoryType): Observable<AccessoryType> {
    return this.http.put<AccessoryType>(`${this.baseUrl}/${id}`, accessoryType);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
