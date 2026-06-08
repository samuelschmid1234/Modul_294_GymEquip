import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AccessorySets } from './accessory-sets';
import { AccessorySetService } from '../../service/accessory-set.service';
import { AuthService } from '../../service/auth.service';

describe('AccessorySets', () => {
  let component: AccessorySets;
  let fixture: ComponentFixture<AccessorySets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessorySets],
      providers: [
        provideNoopAnimations(),
        { provide: AccessorySetService, useValue: { getAll: () => of([]) } },
        { provide: AuthService, useValue: { canWrite: () => true, canDelete: () => true, userRoles: () => ['admin'] } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(undefined) }) } },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessorySets);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
