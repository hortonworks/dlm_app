import { TestBed, inject } from '@angular/core/testing';

import { AddOnAppService } from './add-on-app.service';

describe('AddOnAppService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddOnAppService]
    });
  });

  it('should be created', inject([AddOnAppService], (service: AddOnAppService) => {
    expect(service).toBeTruthy();
  }));
});
