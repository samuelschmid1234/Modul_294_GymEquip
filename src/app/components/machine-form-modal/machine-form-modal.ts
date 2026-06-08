import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Machine } from '../../models/machine.model';
import { Category } from '../../models/category.model';
import { InventoryItemType, Status, STATUS_LABELS } from '../../models/enums';
import { CategoryService } from '../../service/category.service';

export interface MachineFormDialogData {
  machine?: Machine;
}

interface MachineForm {
  name: FormControl<string>;
  brand: FormControl<string>;
  serialNumber: FormControl<string>;
  price: FormControl<number>;
  comment: FormControl<string>;
  categoryId: FormControl<number | null>;
  status: FormControl<Status>;
  lastRestoration: FormControl<string>;
  nextRestoration: FormControl<string>;
}

@Component({
  selector: 'app-machine-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './machine-form-modal.html',
  styleUrl: './machine-form-modal.scss',
})
export class MachineFormModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly dialogRef = inject<MatDialogRef<MachineFormModal, Machine | undefined>>(MatDialogRef);
  protected readonly data = inject<MachineFormDialogData>(MAT_DIALOG_DATA);

  readonly categories = signal<Category[]>([]);
  readonly statusOptions = Object.values(Status).map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  }));

  protected readonly form = this.fb.nonNullable.group<MachineForm>({
    name: this.fb.nonNullable.control('', Validators.required),
    brand: this.fb.nonNullable.control('', Validators.required),
    serialNumber: this.fb.nonNullable.control('', Validators.required),
    price: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    comment: this.fb.nonNullable.control(''),
    categoryId: this.fb.control<number | null>(null, Validators.required),
    status: this.fb.nonNullable.control(Status.IN_USE, Validators.required),
    lastRestoration: this.fb.nonNullable.control(''),
    nextRestoration: this.fb.nonNullable.control(''),
  });

  get isEdit(): boolean {
    return !!this.data.machine;
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((categories) => this.categories.set(categories));

    const machine = this.data.machine;
    if (machine) {
      this.form.patchValue({
        name: machine.name,
        brand: machine.brand,
        serialNumber: machine.serialNumber,
        price: machine.price,
        comment: machine.comment ?? '',
        categoryId: machine.category?.id ?? null,
        status: machine.status,
        lastRestoration: machine.lastRestoration ?? '',
        nextRestoration: machine.nextRestoration ?? '',
      });
    }
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

    const result: Machine = {
      ...this.data.machine,
      name: value.name,
      brand: value.brand,
      serialNumber: value.serialNumber,
      price: value.price,
      comment: value.comment || undefined,
      category,
      status: value.status,
      lastRestoration: value.lastRestoration || undefined,
      nextRestoration: value.nextRestoration || undefined,
      type: InventoryItemType.MACHINE,
    };

    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
