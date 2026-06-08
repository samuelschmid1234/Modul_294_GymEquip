import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessorySets } from './accessory-sets';

describe('AccessorySets', () => {
  let component: AccessorySets;
  let fixture: ComponentFixture<AccessorySets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessorySets],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessorySets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
