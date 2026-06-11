import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AccessorySet } from '../../models/accessory-set.model';
import { Accessory } from '../../models/accessory.model';
import { Category } from '../../models/category.model';
import { AccessoryType } from '../../models/accessory-type.model';
import { InventoryItemType, Status, STATUS_LABELS } from '../../models/enums';
import { CategoryService } from '../../service/category.service';
import { AccessoryTypeService } from '../../service/accessory-type.service';

export interface AccessorySetDialogData {
  accessorySet?: AccessorySet;
}

interface AccessoryGroupControls {
  accessoryTypeId: FormControl<number | null>;
  weight: FormControl<number>;
  count: FormControl<number>;
  status: FormControl<Status>;
}

function toDateInputValue(value?: string): string {
  if (value) {
    return value.slice(0, 10);
  }

  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-accessory-set-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './accessory-set-form-modal.html',
  styleUrl: './accessory-set-form-modal.scss',
})
export class AccessorySetFormModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly accessoryTypeService = inject(AccessoryTypeService);
  private readonly dialogRef =
    inject<MatDialogRef<AccessorySetFormModal, AccessorySet | undefined>>(MatDialogRef);
  protected readonly data = inject<AccessorySetDialogData>(MAT_DIALOG_DATA);

  readonly categories = signal<Category[]>([]);
  readonly accessoryTypes = signal<AccessoryType[]>([]);

  readonly statusOptions = Object.values(Status).map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  }));

  protected readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]),
    brand: this.fb.nonNullable.control('', Validators.maxLength(100)),
    price: this.fb.nonNullable.control(0, Validators.min(0)),
    purchaseDate: this.fb.nonNullable.control(toDateInputValue(), Validators.required),
    comment: this.fb.nonNullable.control('', Validators.maxLength(500)),
    categoryId: this.fb.control<number | null>(null, Validators.required),
    accessories: this.fb.array<FormGroup<AccessoryGroupControls>>([]),
  });

  get accessoriesArray(): FormArray<FormGroup<AccessoryGroupControls>> {
    return this.form.controls.accessories;
  }

  readonly isEdit = computed(() => !!this.data.accessorySet);

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((cats) => this.categories.set(cats));
    this.accessoryTypeService.getAll().subscribe((types) => this.accessoryTypes.set(types));

    const set = this.data.accessorySet;
    if (set) {
      this.form.patchValue({
        name: set.name,
        brand: set.brand,
        price: set.price,
        purchaseDate: toDateInputValue(set.purchaseDate),
        comment: set.comment ?? '',
        categoryId: set.category?.id ?? null,
      });
      for (const acc of set.accessoryList ?? []) {
        this.addAccessory(acc);
      }
    }
  }

  addAccessory(initial?: Accessory): void {
    this.accessoriesArray.push(
      this.fb.nonNullable.group<AccessoryGroupControls>({
        accessoryTypeId: this.fb.control<number | null>(
          initial?.accessoryType?.id ?? null,
          Validators.required,
        ),
        weight: this.fb.nonNullable.control(initial?.weight ?? 0, [Validators.min(0)]),
        count: this.fb.nonNullable.control(initial?.count ?? 1, [
          Validators.required,
          Validators.min(0),
        ]),
        status: this.fb.nonNullable.control(initial?.status ?? Status.IN_USE, Validators.required),
      }),
    );
  }

  removeAccessory(index: number): void {
    this.accessoriesArray.removeAt(index);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const category = this.categories().find((c) => c.id === value.categoryId);
    if (!category) {
      return;
    }

    const accessoryList: Accessory[] = value.accessories.map((entry) => {
      const type = this.accessoryTypes().find((t) => t.id === entry.accessoryTypeId);
      return {
        accessoryType: type ?? { name: '' },
        weight: entry.weight,
        count: entry.count,
        status: entry.status,
      };
    });

    const result: AccessorySet = {
      ...this.data.accessorySet,
      name: value.name,
      brand: value.brand,
      price: value.price,
      purchaseDate: value.purchaseDate,
      comment: value.comment || undefined,
      category,
      type: InventoryItemType.ACCESSORY_SET,
      accessoryList,
    };

    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
