import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../service/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatListModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly authService = inject(AuthService);

  readonly navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/machines', label: 'Grossgeräte', icon: 'fitness_center' },
    { path: '/accessory-sets', label: 'Zubehör-Sets', icon: 'inventory_2' },
    { path: '/categories', label: 'Kategorien', icon: 'category' },
  ];

  readonly userName = this.authService.userName;
  readonly role = computed(() => {
    const roles = this.authService.userRoles();
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('update')) return 'update';
    if (roles.includes('read')) return 'read';
    return '';
  });
}
