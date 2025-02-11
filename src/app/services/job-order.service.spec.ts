import { TestBed } from '@angular/core/testing';

import { JobOrderService } from './job-order.service';

describe('JobOrderService', () => {
  let service: JobOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
