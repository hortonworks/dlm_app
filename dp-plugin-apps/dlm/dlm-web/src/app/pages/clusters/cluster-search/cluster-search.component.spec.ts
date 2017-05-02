import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {SearchInputComponent} from '../../../components/search-input/search-input.component';
import {DropdownComponent} from '../../../components/dropdown/dropdown.component';
import {ClusterSearchComponent} from './cluster-search.component';

describe('ClusterSearchComponent', () => {
  let component: ClusterSearchComponent;
  let fixture: ComponentFixture<ClusterSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClusterSearchComponent, SearchInputComponent, DropdownComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
