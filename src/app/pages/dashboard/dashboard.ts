import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MachineService } from '../../service/machine.service';
import { AccessorySetService } from '../../service/accessory-set.service';
import { Machine } from '../../models/machine.model';
import { Status, STATUS_LABELS } from '../../models/enums';

interface StatusCard {
  status: Status;
  label: string;
  count: number;
  variant: 'primary' | 'destructive' | 'secondary' | 'outline';
}

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, MatCardModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly machineService = inject(MachineService);
  private readonly accessorySetService = inject(AccessorySetService);

  readonly machines = signal<Machine[]>([]);
  readonly accessorySetsCount = signal(0);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly totalMachines = computed(() => this.machines().length);
  readonly activeMachines = computed(
    () => this.machines().filter((m) => m.status === Status.IN_USE).length,
  );
  readonly brokenMachines = computed(
    () => this.machines().filter((m) => m.status === Status.BROKEN).length,
  );
  readonly inRepair = computed(
    () => this.machines().filter((m) => m.status === Status.IN_REPARATION).length,
  );

  readonly activeRatio = computed(() => {
    const total = this.totalMachines();
    return total > 0 ? Math.round((this.activeMachines() / total) * 100) : 0;
  });

  readonly statusCards = computed<StatusCard[]>(() => {
    const list = this.machines();
    return (Object.values(Status) as Status[]).map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: list.filter((m) => m.status === status).length,
      variant: this.getVariant(status),
    }));
  });

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
        this.accessorySetsCount.set(sets.length);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Zubehör-Sets konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  private getVariant(status: Status): StatusCard['variant'] {
    switch (status) {
      case Status.IN_USE:
        return 'primary';
      case Status.BROKEN:
        return 'destructive';
      case Status.IN_REPARATION:
        return 'secondary';
      default:
        return 'outline';
    }
  }
}
