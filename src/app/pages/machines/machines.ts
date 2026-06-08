import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { Machine } from '../../models/machine.model';
import { Status, STATUS_LABELS } from '../../models/enums';
import { MachineService } from '../../service/machine.service';
import { AuthService } from '../../service/auth.service';
import { HasRoleDirective } from '../../directives/has-role.directive';
import {
  MachineFormDialogData,
  MachineFormModal,
} from '../../components/machine-form-modal/machine-form-modal';

@Component({
  selector: 'app-machines',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    HasRoleDirective,
  ],
  templateUrl: './machines.html',
  styleUrl: './machines.scss',
})
export class Machines implements OnInit {
  private readonly machineService = inject(MachineService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly machines = signal<Machine[]>([]);
  readonly loading = signal(false);

  readonly canWrite = computed(() => this.authService.canWrite());
  readonly canDelete = computed(() => this.authService.canDelete());

  readonly displayedColumns = [
    'id',
    'name',
    'brand',
    'category',
    'price',
    'status',
    'lastRestoration',
    'actions',
  ];

  ngOnInit(): void {
    this.loadMachines();
  }

  loadMachines(): void {
    this.loading.set(true);
    this.machineService.getAll().subscribe({
      next: (machines) => {
        this.machines.set(machines);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Fehler beim Laden der Maschinen', 'OK', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.openDialog({});
  }

  openEdit(machine: Machine): void {
    this.openDialog({ machine });
  }

  delete(machine: Machine): void {
    if (!machine.id) {
      return;
    }
    if (!confirm(`Maschine "${machine.name}" wirklich löschen?`)) {
      return;
    }
    this.machineService.delete(machine.id).subscribe({
      next: () => {
        this.machines.update((list) => list.filter((m) => m.id !== machine.id));
        this.snackBar.open('Maschine gelöscht', 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Löschen fehlgeschlagen', 'OK', { duration: 3000 }),
    });
  }

  getStatusLabel(status: Status): string {
    return STATUS_LABELS[status];
  }

  getStatusVariant(status: Status): 'primary' | 'destructive' | 'secondary' | 'outline' {
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

  private openDialog(data: MachineFormDialogData): void {
    const ref = this.dialog.open<MachineFormModal, MachineFormDialogData, Machine | undefined>(
      MachineFormModal,
      { data, autoFocus: false },
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const existing = data.machine;
      if (existing?.id) {
        this.machineService.update(existing.id, { ...result, id: existing.id }).subscribe({
          next: (updated) => {
            this.machines.update((list) => list.map((m) => (m.id === updated.id ? updated : m)));
            this.snackBar.open('Maschine aktualisiert', 'OK', { duration: 2000 });
          },
          error: () => this.snackBar.open('Aktualisierung fehlgeschlagen', 'OK', { duration: 3000 }),
        });
      } else {
        this.machineService.create(result).subscribe({
          next: (created) => {
            this.machines.update((list) => [...list, created]);
            this.snackBar.open('Maschine angelegt', 'OK', { duration: 2000 });
          },
          error: () => this.snackBar.open('Anlegen fehlgeschlagen', 'OK', { duration: 3000 }),
        });
      }
    });
  }
}
