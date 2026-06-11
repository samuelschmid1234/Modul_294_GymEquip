import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Dashboard } from './dashboard';
import { MachineService } from '../../service/machine.service';
import { AccessorySetService } from '../../service/accessory-set.service';
import { CategoryService } from '../../service/category.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: MachineService, useValue: { getAll: () => of([]) } },
        { provide: AccessorySetService, useValue: { getAll: () => of([]) } },
        { provide: CategoryService, useValue: { getAll: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
