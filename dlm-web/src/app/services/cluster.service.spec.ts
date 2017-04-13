import { TestBed, inject } from '@angular/core/testing';
import { ClusterService } from './cluster.service';

describe('ClusterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClusterService]
    });
  });

  it('should ...', inject([ClusterService], (service: ClusterService) => {
    expect(service).toBeTruthy();
  }));
});
