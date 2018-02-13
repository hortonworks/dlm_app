/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { SimpleChange } from '@angular/core';
import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {ReactiveFormsModule, FormsModule, AbstractControl, FormGroup} from '@angular/forms';
import {CollapseModule, TabsModule, TypeaheadModule, TimepickerModule} from 'ngx-bootstrap';
import { MyDatePickerModule } from 'mydatepicker';
import * as moment from 'moment-timezone';

import { CommonComponentsModule } from 'components/common-components.module';
import {RadioButtonComponent} from 'common/radio-button/radio-button.component';
import {CheckboxListComponent} from 'common/checkbox-list/checkbox-list.component';
import {CheckboxComponent} from 'common/checkbox/checkbox.component';
import {CheckboxColumnComponent} from 'components/table-columns/checkbox-column/checkbox-column.component';
import {PolicyFormComponent} from './policy-form.component';
import {HdfsBrowserComponent} from 'components/hdfs-browser/hdfs-browser.component';
import {TableComponent} from 'common/table/table.component';
import {TableFooterComponent} from 'common/table/table-footer/table-footer.component';
import {TableFilterComponent} from 'common/table/table-filter/table-filter.component';
import {ActionColumnComponent} from 'components/table-columns/action-column/action-column.component';
import {MomentModule} from 'angular2-moment';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {NavbarService} from 'services/navbar.service';
import {PipesModule} from 'pipes/pipes.module';
import {HdfsService} from 'services/hdfs.service';
import {Observable} from 'rxjs/Observable';
import {TooltipModule} from 'ngx-bootstrap';
import { configureComponentTest } from 'testing/configure';
import { SelectCloudDestinationComponent } from '../select-cloud-destination/select-cloud-destination.component';
import { HiveDatabaseUI, HiveDatabase } from 'models/hive-database.model';
import { Store } from '@ngrx/store';
import { State } from 'reducers';
import { loadDatabases, loadDatabasesSuccess, loadTables } from 'actions/hivelist.action';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { getAllDatabases } from 'selectors/hive.selector';
import { updateProgressState } from 'actions/progress.action';
import { saveFormValue, resetFormValue } from 'actions/form.action';
import { loadYarnQueues, loadYarnQueuesSuccess } from 'actions/yarnqueues.action';
import { Pairing } from 'models/pairing.model';
import * as RouterActions from 'actions/router.action';
import { DatabaseTablesCollapsedEvent } from 'components/hive-browser';
import { ProgressState } from 'models/progress-state.model';
import { TimeZoneService } from 'services/time-zone.service';

describe('PolicyFormComponent', () => {
  let component: PolicyFormComponent;
  let fixture: ComponentFixture<PolicyFormComponent>;
  let store: Store<State>;
  let timezoneService: TimeZoneService;

  beforeEach(async(() => {
    const baseDate = new Date(2018, 1, 1, 0, 0, 0, 0);
    jasmine.clock().mockDate(baseDate);
    const mockHdfsService = {
      getFilesList() {return Observable.of([]); }
    };
    configureComponentTest({
      imports: [
        TooltipModule.forRoot(),
        TimepickerModule.forRoot(),
        ReactiveFormsModule, FormsModule, CollapseModule, TabsModule.forRoot(), MyDatePickerModule,
        CommonComponentsModule,
        MomentModule,
        NgxDatatableModule,
        TypeaheadModule,
        PipesModule
      ],
      declarations: [
        PolicyFormComponent,
        RadioButtonComponent,
        CheckboxComponent,
        CheckboxListComponent,
        CheckboxColumnComponent,
        HdfsBrowserComponent,
        TableComponent,
        TableFooterComponent,
        TableFilterComponent,
        ActionColumnComponent,
        SelectCloudDestinationComponent
      ],
      providers: [
        {provide: HdfsService, useValue: mockHdfsService},
        NavbarService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyFormComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    timezoneService = fixture.debugElement.injector.get(TimeZoneService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('When Policy Type changes #subscribeToPolicyType', () => {
    let form: FormGroup;
    beforeEach(() => {
      form = component.policyForm;
    });
    it('should reset source and destination fields when type is changed', fakeAsync(() => {
      const source = form.get('general.source');
      const destination = form.get('general.destination');
      spyOn(source, 'reset');
      spyOn(destination, 'reset');
      expect(form.get('general.type').value).toBe('FS');
      form.patchValue({ general: { type: 'HIVE' }});
      tick(500);
      expect(source.reset).toHaveBeenCalled();
      expect(destination.reset).toHaveBeenCalled();
    }));
  });

  describe('#activateFieldsForType', () => {
    let form: FormGroup;
    let directories: AbstractControl;
    let databases: AbstractControl;

    beforeEach(() => {
      form = component.policyForm;
      directories = form.get('directories');
      databases = form.get('databases');
    });

    it('should disable "databases" field and enable "directories" when policy type is "FS"', fakeAsync(() => {
      form.patchValue({ general: { type: 'FS' }});
      tick(500);
      expect(directories.enabled).toBeTruthy('directories enabled');
      expect(databases.disabled).toBeTruthy('databases disabled');
    }));

    it('should disable "directories" field and enable "databases" when policy type is "HIVE"', fakeAsync(() => {
      form.patchValue({ general: { type: 'HIVE' }});
      tick(500);
      expect(databases.enabled).toBeTruthy('databases enabled');
      expect(directories.disabled).toBeTruthy('directories disabled');
    }));
  });

  describe('When Source Type changes #subscribeToSourceType', () => {
    let form: FormGroup;
    let source: AbstractControl;
    let directories: AbstractControl;
    let cluster: AbstractControl;
    let cloudAccount: AbstractControl;
    let s3Endpoint: AbstractControl;
    const setType = (_form: FormGroup, type) => {
     _form.patchValue({ general: { source: { type } } });
    };

    beforeEach(() => {
      form = component.policyForm;
      source = form.get('general.source');
      directories = form.get('directories');
      cluster = source.get('cluster');
      cloudAccount = source.get('cloudAccount');
      s3Endpoint = source.get('s3endpoint');
    });

    it('should reset destination field on source type change', fakeAsync(() => {
      const destination = form.get('general.destination');
      spyOn(destination, 'reset');
      setType(form, 'CLUSTER');
      tick(500);
      expect(destination.reset).toHaveBeenCalled();
    }));

    it('should enable Cluster specific fields when source type is "Cluster', fakeAsync(() => {
      setType(form, 'CLUSTER');
      tick(500);
      expect(cluster.enabled).toBeTruthy('cluster enabled');
      expect(directories.enabled).toBeTruthy('directories enabled');
      expect(cloudAccount.disabled).toBeTruthy('source cloud account disabled');
      expect(s3Endpoint.disabled).toBeTruthy('source s3 endpoint account disabled');
    }));

    it('should enable S3 specific fields when source type is "S3', fakeAsync(() => {
      setType(form, 'S3');
      tick(500);
      expect(cloudAccount.enabled).toBeTruthy('source cloud account enabled');
      expect(s3Endpoint.enabled).toBeTruthy('source s3 endpoint account enabled');
      expect(directories.disabled).toBeTruthy('directories disabled');
      expect(cluster.disabled).toBeTruthy('cluster disabled');
    }));
  });

  describe('When Source Cluster changes #subscribeToSourceCluster', () => {
    let form: FormGroup;
    const setCluster = (_form: FormGroup, cluster) => {
      _form.patchValue({ general: { source: { cluster } } });
    };

    beforeEach(() => {
      form = component.policyForm;
    });

    it('should reset hdfs path', fakeAsync(() => {
      component.selectedHdfsPath = '/some';
      setCluster(form, 1);
      tick(1000);
      expect(component.selectedHdfsPath).toBe('/');
    }));

    it('should reset database search string', fakeAsync(() => {
      component.databaseSearch$.next('term');
      tick();
      expect(component.databaseSearch$.getValue()).toBe('term', 'value is term');
      setCluster(form, 1);
      tick(1000);
      expect(component.databaseSearch$.getValue()).toBe('', 'value cleared');
    }));

    it('should set selected source', fakeAsync(() => {
      setCluster(form, 1);
      tick(1000);
      expect(component.selectedSource$.getValue()).toBe(1, 'value is set');
    }));
  });

  describe('When Destination Type changes #subscribeToDestinationType', () => {
    let form: FormGroup;
    let destination: AbstractControl;
    let cluster: AbstractControl;
    let cloudAccount: AbstractControl;
    let s3Endpoint: AbstractControl;
    const setType = (_form: FormGroup, type) => {
     _form.patchValue({ general: { destination: { type } } });
    };

    beforeEach(() => {
      form = component.policyForm;
      destination = form.get('general.destination');
      cluster = destination.get('cluster');
      cloudAccount = destination.get('cloudAccount');
      s3Endpoint = destination.get('s3endpoint');
    });

    it('should enable Cluster specific fields when destination type is "Cluster', fakeAsync(() => {
      setType(form, 'CLUSTER');
      tick(500);
      expect(cluster.enabled).toBeTruthy('cluster enabled');
      expect(cloudAccount.disabled).toBeTruthy('source cloud account disabled');
      expect(s3Endpoint.disabled).toBeTruthy('source s3 endpoint account disabled');
    }));

    it('should enable S3 specific fields when source type is "S3', fakeAsync(() => {
      setType(form, 'S3');
      tick(500);
      expect(cloudAccount.enabled).toBeTruthy('source cloud account enabled');
      expect(s3Endpoint.enabled).toBeTruthy('source s3 endpoint account enabled');
      expect(cluster.disabled).toBeTruthy('cluster disabled');
    }));
  });

  describe('When Database changes #setupDatabaseChanges', () => {
    let form: FormGroup;
    const databases: HiveDatabaseUI[] = [
      { clusterId: 1,  entityId: 't1', name: 't1'},
      { clusterId: 1,  entityId: 't2', name: 't2'},
      { clusterId: 2,  entityId: 'ct1', name: 'ct1'}
    ];

    const setSourceCluster = (_form: FormGroup, clusterId) => {
      _form.patchValue({ general: { source: { cluster: clusterId } } });
    };

    beforeEach(() => {
      store.dispatch(loadDatabasesSuccess(databases as HiveDatabase[], {}));
      spyOn(store, 'dispatch').and.callThrough();
      form = component.policyForm;
    });

    it('should load databases when source cluster changes', fakeAsync(() => {
      setSourceCluster(form, 1);
      tick(1000);
      expect(store.dispatch).toHaveBeenCalledWith(loadDatabases(1, { requestId: '[Policy Form] DATABASE_REQUEST'}));
    }));

    it('should select first database when source changed', fakeAsync(() => {
      setSourceCluster(form, 1);
      component.sourceDatabases$.subscribe();
      tick(1000);
      expect(form.get('databases').value).toBe('t1');
    }));

    it('should emit databases filtered by search pattern', fakeAsync(() => {
      setSourceCluster(form, 1);
      tick(1000);
      component.databaseSearch$.next('t2');
      tick(1000);
      component.sourceDatabases$.subscribe(result => {
        expect(result).toEqual([{ clusterId: 1, entityId: 't2', name: 't2'}] as HiveDatabase[], 'found databases');
      });
    }));

    it('should update loading progress for new request', fakeAsync(() => {
      // assume that table request was finished
      setSourceCluster(form, 1);
      store.dispatch(updateProgressState('[PolicyFormComponent] LOAD_TABLES t1', {isInProgress: false}));
      tick(1000);
      expect(component.databaseTablesLoadingMap['t1']).toBeDefined();
    }));
  });

  describe('When Form Values changes #setupFormChanges', () => {
    let form: FormGroup;
    let initialValue;

    beforeEach(() => {
      form = component.policyForm;
      initialValue = form.getRawValue();
    });

    it('should not restore form value when there is no stored data', fakeAsync(() => {
      const formValue = form.getRawValue();
      store.dispatch(saveFormValue('POLICY_FORM_ID', {}));
      component._sourceClusterId$.next(0);
      tick();
      expect(formValue).toEqual(form.getRawValue());
    }));

    it('should restore value when source cluster id is empty and stored value is present', fakeAsync(() => {
      const storedValue = {
        ...initialValue,
        general: { ...initialValue.general, type: 'HIVE'}
      };
      component._sourceClusterId$.next(0);
      tick(500);
      store.dispatch(saveFormValue('POLICY_FORM_ID', storedValue));
      tick(500);
      expect(form.getRawValue()).toEqual(storedValue);
    }));

    it('should set source cluster id when it passed from parent', fakeAsync(() => {
      component._sourceClusterId$.next(2);
      tick(1000);
      expect(form.get('general.source.cluster').value).toEqual(2, 'source cluster id');
      expect(form.get('general.source.type').value).toEqual('CLUSTER', 'source type');
      expect(component.selectedSource$.getValue()).toBe(2);
    }));
  });

  describe('When Directory changes #setupDirectoryChanges', () => {
    let form: FormGroup;

    beforeEach(() => {
      form = component.policyForm;
    });

    it('should change hdfs root path to form value and set pending status', fakeAsync(() => {
      form.patchValue({ directories: '/newpath'});
      tick(500);
      expect(component.hdfsRootPath).toBe('/newpath', 'new value is set');
      expect(form.get('directories').valid).toBeFalsy('field marked as not valid');
      expect(form.get('directories').errors['pending']).toBeTruthy('pending error is set');
    }));

    it('should remove pending error from directories when request finishes without errors', fakeAsync(() => {
      form.patchValue({ directories: '/path' });
      tick(500);
      store.dispatch(updateProgressState('[HDFS Browser Component] FILES_REQUEST', {
        isInProgress: false,
        error: false,
        response: {
          fileList: [{ type: 'DIRECTORY '}]
        }
      }));
      tick();
      expect(form.get('directories').value).toBe('/path', 'value is set');
      expect(form.get('directories').valid).toBeTruthy('value is valid');
    }));

    it('should mark field as invalid when selected path is file', fakeAsync(() => {
      form.patchValue({ directories: '/path.txt' });
      tick(500);
      store.dispatch(updateProgressState('[HDFS Browser Component] FILES_REQUEST', {
        isInProgress: false,
        error: false,
        response: {
          fileList: [{ type: 'FILE', pathSuffix: 'path.txt' }]
        }
      }));
      tick();
      expect(form.get('directories').value).toBe('/path.txt', 'value is set');
      expect(form.get('directories').valid).toBeFalsy('value is not valid');
      expect(form.get('directories').errors['isFile']).toBeTruthy('file error is set');
    }));

    it('should mark field as invalid when selected path is exists', fakeAsync(() => {
      form.patchValue({ directories: '/path.txt' });
      tick(500);
      store.dispatch(updateProgressState('[HDFS Browser Component] FILES_REQUEST', {
        isInProgress: false,
        error: true
      }));
      tick();
      expect(form.get('directories').value).toBe('/path.txt', 'value is set');
      expect(form.get('directories').valid).toBeFalsy('value is not valid');
      expect(form.get('directories').errors['notExist']).toBeTruthy('not exist error is set');
    }));
  });

  describe('When Destination changes #setupDestinationChanges', () => {
    let form: FormGroup;
    beforeEach(() => {
      spyOn(store, 'dispatch').and.callThrough();
      form = component.policyForm;
    });

    it('should load yarn queues when destination cluster changes', fakeAsync(() => {
      form.patchValue({ general: { destination: { cluster: 1, type: 'CLUSTER' } } });
      tick(500);
      expect(store.dispatch).toHaveBeenCalledWith(loadYarnQueues(1));
    }));

    it('should not load yarn queues when destination is not a "Cluster"', fakeAsync(() => {
      form.patchValue({ general: { destination: { type: 'S3' } } });
      tick(500);
      expect(store.dispatch).not.toHaveBeenCalled();
    }));

    it('should set queue name from the loaded queue list', fakeAsync(() => {
      form.patchValue({ general: { destination: { cluster: 1, type: 'CLUSTER' } } });
      store.dispatch(loadYarnQueuesSuccess({
        response: {
          items: [
            {
              name: 'root',
              path: 'root',
              children: [{ name: 'default', path: 'root.default', children: [] }]
            }
          ]
        },
        clusterId: 1
      }, {}));
      tick(500);
      expect(component.yarnQueueList).toEqual([{ label: 'default', value: 'default' }], 'yarn queue list created');
      expect(form.get('advanced.queue_name').value).toBe('default', 'queue_name value is set');
    }));

    it('should not set queue name when form value was restored', fakeAsync(() => {
      const storedValue = {
        ...form.getRawValue(),
        general: {
          ...form.getRawValue().general,
          destination: {
            cluster: 1,
            type: 'CLUSTER'
          }
        },
        advanced: {
          queue_name: 'stored_queue'
        }
      };
      store.dispatch(saveFormValue('POLICY_FORM_ID', storedValue));
      tick(500);
      store.dispatch(loadYarnQueuesSuccess({
        response: {
          items: [
            {
              name: 'root',
              path: 'root',
              children: [{ name: 'default', path: 'root.default', children: [] }]
            }
          ]
        },
        clusterId: 1
      }, {}));
      tick(1000);
      expect(component.yarnQueueList).toEqual([{ label: 'default', value: 'default' }], 'yarn queue list created');
      expect(form.get('advanced.queue_name').value).toBe('stored_queue', 'queue_name is not changed');
    }));
  });

  describe('#ngOnChanges', () => {
    it('should emit new value to _pairings$ when pairings changes', fakeAsync(() => {
      const newValue = [{id: '1'}, {id: '2'}] as Pairing[];
      component.pairings = newValue;
      component.ngOnChanges({
        pairings: new SimpleChange(null, component.pairings, false)
      });
      tick();
      expect(component._pairings$.getValue()).toEqual(newValue);
    }));

    it('should emit new value to _sourceClusterId$ when sourceClusterId changes', fakeAsync(() => {
      component.sourceClusterId = 2;
      component.ngOnChanges({
        sourceClusterId: new SimpleChange(null, component.sourceClusterId, false)
      });
      tick(1000);
      expect(component._sourceClusterId$.getValue()).toEqual(2);
    }));
  });

  describe('#cancel', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
    });

    it('should redirect to policies page and reset form value', () => {
      component.cancel();
      expect(store.dispatch).toHaveBeenCalledWith(resetFormValue('POLICY_FORM_ID'));
      expect(store.dispatch).toHaveBeenCalledWith(new RouterActions.Go({path: ['policies']}));
    });
  });

  describe('#handleStartChange', () => {
    let form: FormGroup;

    beforeEach(() => {
      form = component.policyForm;
    });

    it('should update day with current day and take user timezone when From Now selected', fakeAsync(() => {
      component.handleStartChange({ value: 'START_NOW' });
      tick(500);
      expect(form.get('job.start').value).toBe('START_NOW', 'start type is set');
      expect(form.get('job.day').value).toBe(moment().tz(timezoneService.userTimezone.zones[0].value).format('d'), 'day is set');
      expect(form.get('job.startTime.time').value).toEqual(moment(component.defaultTime).toDate(), 'startTime time is set');
    }));

    it('should not update day when On Schedule is selected', fakeAsync(() => {
      component.handleStartChange({ value: 'ON_SCHEDULE' });
      tick(500);
      expect(form.get('job.start').value).toBe('ON_SCHEDULE', 'start type is set');
      expect(form.get('job.day').value).toBe('1', 'day is default');
      expect(form.get('job.startTime.time').value).toEqual(moment(component.defaultTime).toDate(), 'startTime time is set');
    }));
  });

  describe('#onDatabaseTablesCollapsed', () => {
    const dbEvent: DatabaseTablesCollapsedEvent = {
      database: {
        entityId: 'db1',
        clusterId: 1,
        database: 'db1',
        name: 'db1'
      },
      collapsed: true
    };

    beforeEach(() => {
      spyOn(store, 'dispatch');
    });

    it('should load tables when they were not loaded before', () => {
      component.onDatabaseTablesCollapsed(dbEvent);
      expect(store.dispatch).toHaveBeenCalledWith(loadTables({
        clusterId: 1,
        databaseId: 'db1'
      }, { requestId: '[PolicyFormComponent] LOAD_TABLES db1'}));
      expect(component.databaseTablesLoadingMap['db1']).toEqual({isInProgress: true} as ProgressState, 'progress object added');
    });

    it('should not load tables when they already loaded', () => {
      component.databaseTablesLoadingMap['db1'] = { isInProgress: false } as ProgressState;
      component.onDatabaseTablesCollapsed(dbEvent);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('#handleSubmit', () => {
    beforeEach(() => {
      spyOn(component.formSubmit, 'emit');
    });

    it('should not perform submit if form is not valid', () => {
      spyOnProperty(component.policyForm, 'valid', 'get').and.returnValue(false);
      component.handleSubmit({value: {}});
      expect(component.formSubmit.emit).not.toHaveBeenCalled();
    });

    it('should clear startTime data and time when From Now is selected', () => {
      spyOnProperty(component.policyForm, 'valid', 'get').and.returnValue(true);
      const value = {
        job: {
          start: 'START_NOW',
          startTime: {
            time: new Date(),
            date: new Date()
          }
        }
      };
      component.handleSubmit({value});
      expect(component.formSubmit.emit).toHaveBeenCalledWith({
        userTimezone: 'Atlantic/Reykjavik',
        job: {
          start: 'START_NOW',
          startTime: {
            time: '',
            date: ''
          }
        }
      });
    });

    it('should set appropriate values on submit when Weeks frequency selected', () => {
      spyOnProperty(component.policyForm, 'valid', 'get').and.returnValue(true);
      const value = {
        job: {
          unit: 'WEEKS',
          day: '1',
          frequency: 1,
          repeatMode: 'EVERY',
          startTime: {
            time: new Date(),
            date: new Date()
          },
          endTime: {
            date: new Date()
          }
        }
      };
      const expectedStartTimeDate = moment(value.job.startTime.date).add(1, 'weeks').isoWeekday(+value.job.day).format('YYYY-MM-DD');
      component.handleSubmit({ value });
      const resultValue: any = (component.formSubmit.emit as jasmine.Spy).calls.argsFor(0)[0];
      expect(resultValue.job.frequencyInSec).toBe(7 * 24 * 60 * 60, 'frequency is set');
      expect(resultValue.job.startTime.date).toEqual(expectedStartTimeDate, 'start date is set');
    });

    it('should set end time as 1 minute before the end of the selected end date', () => {
      spyOnProperty(component.policyForm, 'valid', 'get').and.returnValue(true);
      const value = {
        job: {
          repeatMode: 'EVERY',
          endTime: {
            date: new Date()
          }
        }
      };
      const expectedEndTime = component.getEndTime(value.job.endTime.date);
      component.handleSubmit({ value });
      const resultValue: any = (component.formSubmit.emit as jasmine.Spy).calls.argsFor(0)[0];
      expect(resultValue.job.endTime.time).toEqual(expectedEndTime, 'end time is set');
    });
  });
});
