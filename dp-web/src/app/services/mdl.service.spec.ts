import { TestBed, inject } from '@angular/core/testing';

import { MdlService } from './mdl.service';

describe('MdlService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MdlService]
    });
  });

  it('should ...', inject([MdlService], (service: MdlService) => {
    expect(service).toBeTruthy();
  }));
});
