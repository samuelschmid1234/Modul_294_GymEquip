import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { Machines } from './machines';
import { MachineService } from '../../service/machine.service';
import { AuthService } from '../../service/auth.service';
import { Machine } from '../../models/machine.model';
import { InventoryItemType, Status } from '../../models/enums';

describe('Machines', () => {
  let fixture: ComponentFixture<Machines>;
  let component: Machines;

  let machineServiceMock: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let authServiceMock: { canWrite: () => boolean; canDelete: () => boolean; userRoles: () => string[] };
  let dialogStub: { open: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };

  const sample: Machine = {
    id: 1,
    name: 'Leg Press',
    brand: 'TechnoGym',
    serialNumber: 'TG-LP-001',
    price: 4500,
    category: { id: 1, name: 'BEINE' },
    status: Status.IN_USE,
    type: InventoryItemType.MACHINE,
  };

  function makeDialogRef(result: unknown): MatDialogRef<unknown> {
    return { afterClosed: () => of(result) } as unknown as MatDialogRef<unknown>;
  }

  beforeEach(async () => {
    machineServiceMock = {
      getAll: vi.fn().mockReturnValue(of([sample])),
      create: vi.fn().mockImplementation((m: Machine) => of({ ...m, id: 99 })),
      update: vi.fn().mockImplementation((id: number, m: Machine) => of({ ...m, id })),
      delete: vi.fn().mockReturnValue(of(void 0)),
    };
    authServiceMock = {
      canWrite: () => true,
      canDelete: () => true,
      userRoles: () => ['admin'],
    };
    dialogStub = { open: vi.fn() };
    snackBarMock = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Machines],
      providers: [
        provideNoopAnimations(),
        { provide: MachineService, useValue: machineServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Machines);
    component = fixture.componentInstance;

    // Inject our dialog stub directly into the component instance so dialog.open()
    // is fully controlled by the test (MatDialog provider can be auto-instantiated by
    // standalone-component imports, which makes TestBed-level provider overrides unreliable).
    (component as unknown as { dialog: typeof dialogStub }).dialog = dialogStub;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit() loads machines through the service', () => {
    component.ngOnInit();
    expect(machineServiceMock.getAll).toHaveBeenCalled();
    expect(component.machines()).toEqual([sample]);
    expect(component.loading()).toBe(false);
  });

  it('loadMachines() shows a snackbar when loading fails', () => {
    machineServiceMock.getAll.mockReturnValueOnce(throwError(() => new Error('fail')));
    component.loadMachines();
    expect(snackBarMock.open).toHaveBeenCalled();
    expect(component.loading()).toBe(false);
  });

  it('openCreate() opens the dialog and creates a new machine after close', () => {
    const created = { ...sample, id: 99, name: 'Neu' };
    dialogStub.open.mockReturnValue(makeDialogRef({ ...sample, id: undefined, name: 'Neu' }));
    machineServiceMock.create.mockReturnValueOnce(of(created));

    component.openCreate();

    expect(dialogStub.open).toHaveBeenCalled();
    expect(machineServiceMock.create).toHaveBeenCalled();
    expect(component.machines().some((m) => m.id === 99)).toBe(true);
  });

  it('openEdit() opens the dialog and updates the existing machine after close', () => {
    component.machines.set([sample]);
    dialogStub.open.mockReturnValue(makeDialogRef({ ...sample, name: 'Updated' }));
    machineServiceMock.update.mockReturnValueOnce(of({ ...sample, name: 'Updated' }));

    component.openEdit(sample);

    expect(dialogStub.open).toHaveBeenCalled();
    expect(machineServiceMock.update).toHaveBeenCalledWith(1, expect.objectContaining({ id: 1 }));
    expect(component.machines()[0].name).toBe('Updated');
  });

  it('openEdit() does nothing if the dialog is dismissed', () => {
    dialogStub.open.mockReturnValue(makeDialogRef(undefined));

    component.openEdit(sample);
    expect(machineServiceMock.update).not.toHaveBeenCalled();
  });

  it('delete() removes a machine after the user confirms', () => {
    component.machines.set([sample]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.delete(sample);

    expect(machineServiceMock.delete).toHaveBeenCalledWith(1);
    expect(component.machines()).toEqual([]);
  });

  it('delete() does nothing if the user cancels', () => {
    component.machines.set([sample]);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.delete(sample);

    expect(machineServiceMock.delete).not.toHaveBeenCalled();
    expect(component.machines()).toEqual([sample]);
  });

  it('delete() shows a snackbar when deletion fails', () => {
    component.machines.set([sample]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    machineServiceMock.delete.mockReturnValueOnce(throwError(() => new Error('fail')));

    component.delete(sample);

    expect(snackBarMock.open).toHaveBeenCalled();
  });

  it('getStatusLabel() returns the German label for the status', () => {
    expect(component.getStatusLabel(Status.IN_USE)).toBe('In Betrieb');
    expect(component.getStatusLabel(Status.BROKEN)).toBe('Defekt');
    expect(component.getStatusLabel(Status.IN_REPARATION)).toBe('In Reparatur');
    expect(component.getStatusLabel(Status.IN_STORAGE)).toBe('Im Lager');
    expect(component.getStatusLabel(Status.LOST)).toBe('Verloren');
    expect(component.getStatusLabel(Status.DISPOSED)).toBe('Entsorgt');
  });

  it('getStatusVariant() maps statuses to UI variants', () => {
    expect(component.getStatusVariant(Status.IN_USE)).toBe('primary');
    expect(component.getStatusVariant(Status.BROKEN)).toBe('destructive');
    expect(component.getStatusVariant(Status.IN_REPARATION)).toBe('secondary');
    expect(component.getStatusVariant(Status.IN_STORAGE)).toBe('outline');
    expect(component.getStatusVariant(Status.LOST)).toBe('outline');
    expect(component.getStatusVariant(Status.DISPOSED)).toBe('outline');
  });

  it('canWrite()/canDelete() reflect AuthService permissions', () => {
    expect(component.canWrite()).toBe(true);
    expect(component.canDelete()).toBe(true);
  });

  it('uses MatDialog from DI when not overridden in the test', () => {
    expect(TestBed.inject(MatDialog)).toBeTruthy();
  });
});
