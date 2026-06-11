import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { MachineService } from './machine.service';
import { Machine } from '../models/machine.model';
import { InventoryItemType, Status } from '../models/enums';
import { environment } from '../../environments/environment';

describe('MachineService', () => {
  let service: MachineService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.backendBaseUrl}/api/machines`;

  const sample: Machine = {
    id: 1,
    name: 'Leg Press',
    brand: 'TechnoGym',
    serialNumber: 'TG-LP-001',
    price: 4500,
    purchaseDate: '2026-06-11',
    category: { id: 1, name: 'BEINE' },
    status: Status.IN_USE,
    type: InventoryItemType.MACHINE,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MachineService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MachineService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() should GET the list of machines', () => {
    const machines: Machine[] = [sample];

    service.getAll().subscribe((result) => {
      expect(result).toEqual(machines);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(machines);
  });

  it('getById() should GET a single machine', () => {
    service.getById(1).subscribe((result) => {
      expect(result).toEqual(sample);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(sample);
  });

  it('create() should POST a new machine and return the created entity', () => {
    const { id: _omit, ...payload } = sample;
    void _omit;
    const created: Machine = { ...sample, id: 2 };

    service.create(payload as Machine).subscribe((result) => {
      expect(result).toEqual(created);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(created);
  });

  it('update() should PUT a machine to the correct URL', () => {
    const changed: Machine = { ...sample, status: Status.BROKEN };

    service.update(1, changed).subscribe((result) => {
      expect(result).toEqual(changed);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(changed);
    req.flush(changed);
  });

  it('delete() should DELETE the resource', () => {
    let completed = false;

    service.delete(1).subscribe(() => (completed = true));

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBe(true);
  });
});
