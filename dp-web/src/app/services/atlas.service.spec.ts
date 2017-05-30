import { TestBed, inject } from '@angular/core/testing';

import { AtlasService } from './atlas.service';

describe('AtlasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AtlasService]
    });
  });

  it('should ...', inject([AtlasService], (service: AtlasService) => {
    expect(service).toBeTruthy();
  }));
});
