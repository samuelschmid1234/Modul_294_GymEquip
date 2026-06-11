import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AccessorySet } from '../../models/accessory-set.model';
import { AccessorySetService } from '../../service/accessory-set.service';
import { AuthService } from '../../service/auth.service';
import { HasRoleDirective } from '../../directives/has-role.directive';
import { AccessoryItemCard } from '../../components/accessory-item-card/accessory-item-card';
import {
  AccessorySetDialogData,
  AccessorySetFormModal,
} from '../../components/accessory-set-form-modal/accessory-set-form-modal';

@Component({
  selector: 'app-accessory-sets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    HasRoleDirective,
    AccessoryItemCard,
  ],
  templateUrl: './accessory-sets.html',
  styleUrl: './accessory-sets.scss',
})
export class AccessorySets implements OnInit {
  private readonly accessorySetService = inject(AccessorySetService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly sets = signal<AccessorySet[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.accessorySetService.getAll().subscribe({
      next: (sets) => {
        this.sets.set(sets);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Fehler beim Laden der Sets', 'OK', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  totalItems(set: AccessorySet): number {
    return (set.accessoryList ?? []).reduce((total, item) => total + item.count, 0);
  }

  openCreate(): void {
    this.openDialog({});
  }

  openEdit(set: AccessorySet): void {
    this.openDialog({ accessorySet: set });
  }

  delete(set: AccessorySet): void {
    if (!set.id) return;
    if (!confirm(`Set "${set.name}" wirklich löschen?`)) return;
    this.accessorySetService.delete(set.id).subscribe({
      next: () => {
        this.sets.update((list) => list.filter((s) => s.id !== set.id));
        this.snackBar.open('Set gelöscht', 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Löschen fehlgeschlagen', 'OK', { duration: 3000 }),
    });
  }

  updateAccessoryCount(set: AccessorySet, index: number, newCount: number): void {
    if (!set.id) return;
    const updatedList = (set.accessoryList ?? []).map((acc, idx) =>
      idx === index ? { ...acc, count: newCount } : acc,
    );
    const updated: AccessorySet = { ...set, accessoryList: updatedList };
    this.accessorySetService.update(set.id, updated).subscribe({
      next: (res) => {
        this.sets.update((list) => list.map((s) => (s.id === res.id ? res : s)));
      },
      error: () => this.snackBar.open('Aktualisierung fehlgeschlagen', 'OK', { duration: 3000 }),
    });
  }

  removeAccessory(set: AccessorySet, index: number): void {
    if (!set.id) return;
    const updatedList = (set.accessoryList ?? []).filter((_, idx) => idx !== index);
    const updated: AccessorySet = { ...set, accessoryList: updatedList };
    this.accessorySetService.update(set.id, updated).subscribe({
      next: (res) => {
        this.sets.update((list) => list.map((s) => (s.id === res.id ? res : s)));
        this.snackBar.open('Zubehör entfernt', 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Entfernen fehlgeschlagen', 'OK', { duration: 3000 }),
    });
  }

  private openDialog(data: AccessorySetDialogData): void {
    const ref = this.dialog.open<
      AccessorySetFormModal,
      AccessorySetDialogData,
      AccessorySet | undefined
    >(AccessorySetFormModal, { data, autoFocus: false, minWidth: '50vw' });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const existing = data.accessorySet;
      if (existing?.id) {
        this.accessorySetService.update(existing.id, { ...result, id: existing.id }).subscribe({
          next: (updated) => {
            this.sets.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
            this.snackBar.open('Set aktualisiert', 'OK', { duration: 2000 });
          },
          error: () => this.snackBar.open('Aktualisierung fehlgeschlagen', 'OK', { duration: 3000 }),
        });
      } else {
        this.accessorySetService.create(result).subscribe({
          next: (created) => {
            this.sets.update((list) => [...list, created]);
            this.snackBar.open('Set angelegt', 'OK', { duration: 2000 });
          },
          error: () => this.snackBar.open('Anlegen fehlgeschlagen', 'OK', { duration: 3000 }),
        });
      }
    });
  }
}
