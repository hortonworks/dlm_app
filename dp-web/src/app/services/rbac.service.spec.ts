import { TestBed, inject } from '@angular/core/testing';

import { RbacService } from './rbac.service';

describe('RbacService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RbacService]
    });
  });

  it('should be created', inject([RbacService], (service: RbacService) => {
    expect(service).toBeTruthy();
  }));
});
