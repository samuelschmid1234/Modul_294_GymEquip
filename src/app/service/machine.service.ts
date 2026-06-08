import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Machine } from '../models/machine.model';

@Injectable({ providedIn: 'root' })
export class MachineService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.backendBaseUrl}/api/machines`;

  getAll(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.baseUrl);
  }

  getById(id: number): Observable<Machine> {
    return this.http.get<Machine>(`${this.baseUrl}/${id}`);
  }

  create(machine: Machine): Observable<Machine> {
    return this.http.post<Machine>(this.baseUrl, machine);
  }

  update(id: number, machine: Machine): Observable<Machine> {
    return this.http.put<Machine>(`${this.baseUrl}/${id}`, machine);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
