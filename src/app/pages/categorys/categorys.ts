import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Category } from '../../models/category.model';
import { AccessoryType } from '../../models/accessory-type.model';
import { CategoryService } from '../../service/category.service';
import { AccessoryTypeService } from '../../service/accessory-type.service';
import { AuthService } from '../../service/auth.service';
import { HasRoleDirective } from '../../directives/has-role.directive';

@Component({
  selector: 'app-categorys',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    HasRoleDirective,
  ],
  templateUrl: './categorys.html',
  styleUrl: './categorys.scss',
})
export class Categorys implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly accessoryTypeService = inject(AccessoryTypeService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly categories = signal<Category[]>([]);
  readonly accessoryTypes = signal<AccessoryType[]>([]);

  readonly newCategoryName = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
  readonly newAccessoryTypeName = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });

  ngOnInit(): void {
    this.loadCategories();
    this.loadAccessoryTypes();
  }

  loadCategories(): void {
    this.categoryService
      .getAll()
      .subscribe({
        next: (list) => this.categories.set(list),
        error: () => this.snackBar.open('Kategorien konnten nicht geladen werden', 'OK', { duration: 3000 }),
      });
  }

  loadAccessoryTypes(): void {
    this.accessoryTypeService
      .getAll()
      .subscribe({
        next: (list) => this.accessoryTypes.set(list),
        error: () => this.snackBar.open('Zubehör-Typen konnten nicht geladen werden', 'OK', { duration: 3000 }),
      });
  }

  addCategory(): void {
    if (this.newCategoryName.invalid) return;
    const name = this.newCategoryName.value.trim().toUpperCase();
    if (!name) return;
    this.categoryService.create({ name }).subscribe({
      next: (created) => {
        this.categories.update((list) => [...list, created]);
        this.newCategoryName.reset('');
        this.snackBar.open('Kategorie hinzugefügt', 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Anlegen fehlgeschlagen', 'OK', { duration: 3000 }),
    });
  }

  deleteCategory(category: Category): void {
    if (!category.id) return;
    if (!confirm(`Kategorie "${category.name}" wirklich löschen?`)) return;
    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((c) => c.id !== category.id));
        this.snackBar.open('Kategorie gelöscht', 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Löschen fehlgeschlagen', 'OK', { duration: 3000 }),
    });
  }

  addAccessoryType(): void {
    if (this.newAccessoryTypeName.invalid) return;
    const name = this.newAccessoryTypeName.value.trim().toUpperCase();
    if (!name) return;
    this.accessoryTypeService.create({ name }).subscribe({
      next: (created) => {
        this.accessoryTypes.update((list) => [...list, created]);
        this.newAccessoryTypeName.reset('');
        this.snackBar.open('Zubehör-Typ hinzugefügt', 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Anlegen fehlgeschlagen', 'OK', { duration: 3000 }),
    });
  }

  deleteAccessoryType(type: AccessoryType): void {
    if (!type.id) return;
    if (!confirm(`Typ "${type.name}" wirklich löschen?`)) return;
    this.accessoryTypeService.delete(type.id).subscribe({
      next: () => {
        this.accessoryTypes.update((list) => list.filter((t) => t.id !== type.id));
        this.snackBar.open('Zubehör-Typ gelöscht', 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Löschen fehlgeschlagen', 'OK', { duration: 3000 }),
    });
  }
}
