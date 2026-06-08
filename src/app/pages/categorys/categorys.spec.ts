import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { Categorys } from './categorys';
import { CategoryService } from '../../service/category.service';
import { AccessoryTypeService } from '../../service/accessory-type.service';
import { AuthService } from '../../service/auth.service';

describe('Categorys', () => {
  let component: Categorys;
  let fixture: ComponentFixture<Categorys>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Categorys],
      providers: [
        provideNoopAnimations(),
        { provide: CategoryService, useValue: { getAll: () => of([]) } },
        { provide: AccessoryTypeService, useValue: { getAll: () => of([]) } },
        { provide: AuthService, useValue: { canWrite: () => true, canDelete: () => true, userRoles: () => ['admin'] } },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Categorys);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
