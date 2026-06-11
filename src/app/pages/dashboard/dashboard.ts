import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MachineService } from '../../service/machine.service';
import { AccessorySetService } from '../../service/accessory-set.service';
import { CategoryService } from '../../service/category.service';
import { Machine } from '../../models/machine.model';
import { AccessorySet } from '../../models/accessory-set.model';
import { Category } from '../../models/category.model';
import { Status, STATUS_LABELS } from '../../models/enums';

interface StatusBar {
  status: Status;
  label: string;
  count: number;
  percent: number;
  variant: 'primary' | 'destructive' | 'warning' | 'muted';
}

interface CategoryBar {
  name: string;
  count: number;
  percent: number;
}

interface MaintenanceItem {
  id?: number;
  name: string;
  dueDate: string;
  daysLeft: number;
  overdue: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, MatCardModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly machineService = inject(MachineService);
  private readonly accessorySetService = inject(AccessorySetService);
  private readonly categoryService = inject(CategoryService);

  readonly machines = signal<Machine[]>([]);
  readonly accessorySets = signal<AccessorySet[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly totalMachines = computed(() => this.machines().length);
  readonly totalSets = computed(() => this.accessorySets().length);
  readonly categoriesCount = computed(() => this.categories().length);
  readonly totalAccessoryPieces = computed(() =>
    this.accessorySets().reduce(
      (sum, set) => sum + (set.accessoryList ?? []).reduce((s, a) => s + (a.count ?? 0), 0),
      0,
    ),
  );

  readonly totalValue = computed(() => {
    const machineValue = this.machines().reduce((sum, m) => sum + (m.price ?? 0), 0);
    const setValue = this.accessorySets().reduce((sum, s) => sum + (s.price ?? 0), 0);
    return machineValue + setValue;
  });

  readonly availability = computed(() => {
    const total = this.totalMachines();
    if (total === 0) return 0;
    const healthy = this.machines().filter(
      (m) => m.status === Status.IN_USE || m.status === Status.IN_STORAGE,
    ).length;
    return Math.round((healthy / total) * 100);
  });

  readonly availabilityVariant = computed<'success' | 'warning' | 'destructive'>(() => {
    const a = this.availability();
    if (a >= 80) return 'success';
    if (a >= 50) return 'warning';
    return 'destructive';
  });

  readonly statusBars = computed<StatusBar[]>(() => {
    const list = this.machines();
    const total = list.length || 1;
    return (Object.values(Status) as Status[])
      .map((status) => {
        const count = list.filter((m) => m.status === status).length;
        return {
          status,
          label: STATUS_LABELS[status],
          count,
          percent: Math.round((count / total) * 100),
          variant: this.getStatusVariant(status),
        };
      })
      .sort((a, b) => b.count - a.count);
  });

  readonly topCategories = computed<CategoryBar[]>(() => {
    const counts = new Map<string, number>();
    const bump = (name?: string) => {
      const key = name ?? 'Ohne Kategorie';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    };
    this.machines().forEach((m) => bump(m.category?.name));
    this.accessorySets().forEach((s) => bump(s.category?.name));

    const total = Array.from(counts.values()).reduce((s, n) => s + n, 0) || 1;
    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  readonly upcomingMaintenance = computed<MaintenanceItem[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.machines()
      .filter((m) => !!m.nextRestoration && m.status !== Status.DISPOSED)
      .map((m) => {
        const due = new Date(m.nextRestoration as string);
        const days = Math.floor((due.getTime() - today.getTime()) / MS_PER_DAY);
        return {
          id: m.id,
          name: m.name,
          dueDate: m.nextRestoration as string,
          daysLeft: days,
          overdue: days < 0,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  });

  readonly overdueCount = computed(
    () => this.upcomingMaintenance().filter((m) => m.overdue).length,
  );

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.machineService.getAll().subscribe({
      next: (machines) => this.machines.set(machines),
      error: () => this.error.set('Maschinen konnten nicht geladen werden.'),
    });

    this.accessorySetService.getAll().subscribe({
      next: (sets) => {
        this.accessorySets.set(sets);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Zubehör-Sets konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });

    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.error.set('Kategorien konnten nicht geladen werden.'),
    });
  }

  private getStatusVariant(status: Status): StatusBar['variant'] {
    switch (status) {
      case Status.IN_USE:
        return 'primary';
      case Status.BROKEN:
      case Status.LOST:
        return 'destructive';
      case Status.IN_REPARATION:
        return 'warning';
      default:
        return 'muted';
    }
  }
}
