import { TestBed } from '@angular/core/testing';

import { MdlServicesService } from './mdl-services.service';

describe('MdlServicesService', () => {
  let service: MdlServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MdlServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
