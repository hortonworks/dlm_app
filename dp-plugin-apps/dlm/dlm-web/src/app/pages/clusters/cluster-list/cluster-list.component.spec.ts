import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import { CommonComponentsModule } from 'components/common-components.module';
import { TableComponent } from 'common/table/table.component';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { ActionColumnComponent } from 'components/table-columns/action-column/action-column.component';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { CheckboxColumnComponent } from 'components/table-columns/checkbox-column/checkbox-column.component';
import { ClusterListComponent } from './cluster-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { HdfsBrowserComponent } from 'components/hdfs-browser/hdfs-browser.component';
import { FormsModule } from '@angular/forms';
import { NavbarService } from 'services/navbar.service';

xdescribe('ClusterListComponent', () => {
  let component: ClusterListComponent;
  let fixture: ComponentFixture<ClusterListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CommonComponentsModule,
        RouterModule,
        NgxDatatableModule,
        FormsModule
      ],
      declarations: [
        ClusterListComponent,
        BytesSizePipe,
        TableComponent,
        TableFooterComponent,
        ActionColumnComponent,
        CheckboxComponent,
        CheckboxColumnComponent,
        HdfsBrowserComponent
      ],
      providers: [
        NavbarService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
