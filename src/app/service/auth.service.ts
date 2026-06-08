import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role } from '../models/role.model';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

interface JwtPayload {
  preferred_username?: string;
  name?: string;
  email?: string;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
}

const TOKEN_KEY = 'gymequip.token';

function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly tokenEndpoint = `${environment.keycloakIssuerUri}/protocol/openid-connect/token`;

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly isAuthenticated = computed(() => this.token() !== null);

  private readonly claims = computed(() => decodeJwt(this.token()));

  readonly userName = computed(() => {
    const c = this.claims();
    return c?.preferred_username ?? c?.name ?? c?.email ?? '';
  });

  readonly userRoles = computed<Role[]>(() => {
    const c = this.claims();
    if (!c) return [];
    const realmRoles = c.realm_access?.roles ?? [];
    const clientRoles = c.resource_access?.[environment.keycloakClientId]?.roles ?? [];
    const all = [...realmRoles, ...clientRoles];
    return all.filter((r): r is Role => r === 'admin' || r === 'update' || r === 'read');
  });

  login(username: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: environment.keycloakClientId,
      username,
      password,
      scope: 'openid profile roles offline_access',
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http
      .post<TokenResponse>(this.tokenEndpoint, body.toString(), { headers })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          this.token.set(res.access_token);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: Role): boolean {
    return this.userRoles().includes(role);
  }

  hasAnyRole(roles: Role[]): boolean {
    return roles.some((r) => this.hasRole(r));
  }

  canRead(): boolean {
    return this.hasAnyRole(['read', 'update', 'admin']);
  }

  canWrite(): boolean {
    return this.hasAnyRole(['update', 'admin']);
  }

  canDelete(): boolean {
    return this.hasRole('admin');
  }
}
