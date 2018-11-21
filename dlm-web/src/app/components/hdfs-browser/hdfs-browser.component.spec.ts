/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HdfsBrowserComponent } from './hdfs-browser.component';
import { TooltipModule } from 'ngx-bootstrap';
import { CustomPipesTestingModule } from 'testing/custom-pipes-testing.module';
import { Store } from '@ngrx/store';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { Cluster } from 'models/cluster.model';
import { MockComponent } from 'testing/mock-component';
import { featureStub, storeStub } from 'testing/mock-services';
import { FILE_TYPES } from 'constants/hdfs.constant';
import { FeatureService } from 'services/feature.service';

describe('CardComponent', () => {
  let component: HdfsBrowserComponent;
  let fixture: ComponentFixture<HdfsBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TooltipModule.forRoot(),
        TranslateTestingModule,
        CustomPipesTestingModule
      ],
      declarations: [
        HdfsBrowserComponent,
        MockComponent({ selector: 'dlm-hdfs-browser-breadcrumb', inputs: ['breadcrumbs', 'clusterName'] }),
        MockComponent({
          selector: 'dlm-table', inputs: ['columns', 'rows', 'offset', 'selectionType',
            'scrollbarV', 'externalSorting', 'loadingIndicator']
        })
      ],
      providers: [
        { provide: Store, useValue: storeStub },
        { provide: FeatureService, useValue: featureStub }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HdfsBrowserComponent);
    component = fixture.componentInstance;
    component.cluster = <Cluster>{ name: '' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#initColumns', () => {

    it('should remove snapshottable column when cluster does not support snapshot feature', () => {
      component.cluster = <Cluster>{ beaconAdminStatus: undefined };
      component.initColumns();
      const column = component.columns.find((col) => col.prop === 'snapshottable');
      expect(column).toBeUndefined();
    });

    it('should remove snapshottable column when cluster supports snapshot feature', () => {
      component.cluster = <Cluster>{ beaconAdminStatus: { beaconAdminStatus: { enableSnapshotBasedReplication: false } } };
      component.initColumns();
      const column = component.columns.find((col) => col.prop === 'snapshottable');
      expect(column).toBeUndefined();
    });

    it('should append snapshottable column when cluster supports snapshot feature', () => {
      component.cluster = <Cluster>{ beaconAdminStatus: { beaconAdminStatus: { enableSnapshotBasedReplication: true } } };
      component.initColumns();
      const column = component.columns.find((col) => col.prop === 'snapshottable');
      expect(column).toBeDefined();
    });
  });

  describe('#handleSelectedAction', () => {
    let param;
    const getPath = jasmine.createSpy('getPath').and.callFake(_ => _);
    const emit = jasmine.createSpy('emit').and.callFake(_ => _);

    beforeEach(() => {
      param = [{ pathSuffix: null, type: FILE_TYPES.DIRECTORY }];
      component.getPath = getPath;
      component.selectFile.emit = emit;
      component.selected = undefined;
      component.selectFiles = true;
    });

    afterEach(() => {
      getPath.calls.reset();
      emit.calls.reset();
    });

    it('should do nothing when no items selected', () => {
      param = [];
      component.handleSelectedAction(param);
      expect(getPath.calls.any()).toBeFalsy();
      expect(component.selected).toBeUndefined();
    });

    it('should do nothing when source is dom event', () => {
      param = <Event>{};
      component.handleSelectedAction(param);
      expect(getPath.calls.any()).toBeFalsy();
      expect(component.selected).toBeUndefined();
    });

    it('should do nothing when selectFiles flag false and FILE selected', () => {
      param[0].type = FILE_TYPES.FILE;
      component.selectFiles = false;
      component.handleSelectedAction(param);
      expect(getPath.calls.any()).toBeFalsy();
      expect(component.selected).toBeUndefined();
    });

    it('should not set selected path when "return to prev folder" selected', () => {
      param[0].pathSuffix = '..';
      component.handleSelectedAction(param);
      expect(component.getPath).toHaveBeenCalledWith(param[0].pathSuffix);
      expect(component.selected).toBeUndefined();
    });

    it('should set selected path', () => {
      param[0].pathSuffix = 'test';
      component.handleSelectedAction(param);
      expect(component.getPath).toHaveBeenCalledWith(param[0].pathSuffix);
      expect(component.selected).toBe(param[0].pathSuffix);
    });

    it('should call emit on selectFile EE with selected path as param', () => {
      param[0].pathSuffix = 'test';
      component.handleSelectedAction(param);
      expect(component.getPath).toHaveBeenCalledWith(param[0].pathSuffix);
      expect(component.selected).toBe(param[0].pathSuffix);
      expect(component.selectFile.emit).toHaveBeenCalledWith(component.selected);
    });
  });

  describe('#handleDoubleClickAction', () => {
    let row;
    const event = { stopPropagation: jasmine.createSpy('stopPropagation') };
    const getPath = jasmine.createSpy('getPath').and.callFake(_ => _);
    const switchDirectory = jasmine.createSpy('switchDirectory').and.callFake(_ => _);

    beforeEach(() => {
      row = { pathSuffix: null, type: FILE_TYPES.DIRECTORY };
      component.getPath = getPath;
      component.switchDirectory = switchDirectory;
    });

    afterEach(() => {
      getPath.calls.reset();
      switchDirectory.calls.reset();
      event.stopPropagation.calls.reset();
    });

    it('should call stopPropagation', () => {
      component.handleDoubleClickAction(row, event);
      expect(event.stopPropagation.calls.any()).toBeTruthy();
    });

    it('should not call stopPropagation', () => {
      component.handleDoubleClickAction(row);
      expect(event.stopPropagation.calls.any()).toBeFalsy();
    });

    it('should do nothing if row isn\'t type directory', () => {
      row.type = 'NOTADIRECTORY';
      component.handleDoubleClickAction(row, event);
      expect(getPath.calls.any()).toBeFalsy();
      expect(switchDirectory.calls.any()).toBeFalsy();
    });

    it('should prepare a path to switch directory', () => {
      row.pathSuffix = 'test';
      component.handleDoubleClickAction(row, event);
      expect(component.getPath).toHaveBeenCalledWith(row.pathSuffix);
      expect(component.switchDirectory).toHaveBeenCalledWith(row.pathSuffix);
    });

    describe('"return to prev folder" selected', () => {

      it('should change a path to switch directory', () => {
        row.pathSuffix = '..';
        const currentDirectory = 'test';
        component['currentDirectory$'].next(currentDirectory);
        component.handleDoubleClickAction(row, event);
        expect(component.getPath).toHaveBeenCalledWith(row.pathSuffix);
        expect(component.switchDirectory).toHaveBeenCalledWith(currentDirectory);
      });

      it('should drop last section of currentDirectory path', () => {
        row.pathSuffix = '..';
        const currentDirectory = 'test1/test2/test3';
        component['currentDirectory$'].next(currentDirectory);
        component.handleDoubleClickAction(row, event);
        expect(component.getPath).toHaveBeenCalledWith(row.pathSuffix);
        expect(component.switchDirectory).toHaveBeenCalledWith('test1/test2');
      });

      it('should return a slash as path when in root folder', () => {
        row.pathSuffix = '..';
        const currentDirectory = '/test1';
        component['currentDirectory$'].next(currentDirectory);
        component.handleDoubleClickAction(row, event);
        expect(component.getPath).toHaveBeenCalledWith(row.pathSuffix);
        expect(component.switchDirectory).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('#getPath', () => {

    it('should add a slash to currentDirectory', () => {
      component['currentDirectory$'].next('test1');
      const path = component.getPath('test2');
      expect(path).toBe('test1/test2');
    });

    it('should not add a slash to currentDirectory', () => {
      component['currentDirectory$'].next('test1/');
      const path = component.getPath('test2');
      expect(path).toBe('test1/test2');
    });

    it('should return path without prefix when in root folder', () => {
      component['currentDirectory$'].next('/');
      const path = component.getPath('test');
      expect(path).toBe('/test');
    });
  });

  describe('#updateBreadcrumbs', () => {
    let breadcrumbs;

    beforeEach(() => {
      component['initialRootPath'] = null;
      component.restrictAboveRootPath = false;
    });

    it('should return an empty arr when arg is empty string', () => {
      breadcrumbs = component.updateBreadcrumbs('');
      expect(breadcrumbs).toEqual([]);
    });

    it('should return breadcrumbs with non-empty urls', () => {
      breadcrumbs = component.updateBreadcrumbs('1/2/3/4/5');
      expect(breadcrumbs).toEqual(
        [
          { label: '/', url: '/' },
          { url: '1/2', label: '2' },
          { url: '1/2/3', label: '3' },
          { url: '1/2/3/4', label: '4' },
          { url: '', label: '5' }
        ]);
    });

    it('should return breadcrumbs arr with empty urls', () => {
      component.restrictAboveRootPath = true;
      breadcrumbs = component.updateBreadcrumbs('1/2/3/4/5');
      expect(breadcrumbs).toEqual(
        [
          { label: '/', url: '' },
          { url: '', label: '2' },
          { url: '', label: '3' },
          { url: '', label: '4' },
          { url: '', label: '5' }
        ]);
    });

    it('should return breadcrumbs arr with switched that url which not compare with root path', () => {
      component['initialRootPath'] = '1/2/3';
      component.restrictAboveRootPath = true;
      breadcrumbs = component.updateBreadcrumbs('1/2/3/4/5');
      expect(breadcrumbs).toEqual([
        { label: '/', url: '' },
        { url: '', label: '2' },
        { url: '1/2/3', label: '3' },
        { url: '1/2/3/4', label: '4' },
        { url: '', label: '5' }
      ]);
    });
  });

  describe('#switchDirectory', () => {
    let returnValue;

    beforeEach(() => {
      component['initialRootPath'] = null;
      component.restrictAboveRootPath = false;
    });

    it('should return false', () => {
      component['initialRootPath'] = '1/2';
      component.restrictAboveRootPath = true;
      returnValue = component.switchDirectory('1/2/3');
      expect(returnValue).toBeFalsy();
    });

    it('should switch the directory', () => {
      const path = 'test';
      component['currentDirectory$'].next = jasmine.createSpy('next');
      component.selectFile.emit = jasmine.createSpy('emit');
      component.openDirectory.emit = jasmine.createSpy('emit');
      component.changePage.emit = jasmine.createSpy('emit');
      component.switchDirectory(path);
      expect(component['currentDirectory$'].next).toHaveBeenCalledWith(path);
      expect(component.selectFile.emit).toHaveBeenCalledWith(component.selected);
      expect(component.openDirectory.emit).toHaveBeenCalledWith(component.selected);
      expect(component.changePage.emit).toHaveBeenCalledWith({ offset: component.page });
    });
  });

  describe('#handleSortAction', () => {
    let event: { sorts: [{ prop: string; dir: string }] };

    beforeEach(() => {
      event = {
        sorts: [{
          prop: '',
          dir: ''
        }]
      };

      component.rows = [
        { pathSuffix: 'c', modificationTime: 12, length: 120 },
        { pathSuffix: 'b', modificationTime: 11, length: 110 },
        { pathSuffix: 'a', modificationTime: 10, length: 100 },
        { pathSuffix: 'd', modificationTime: 13, length: 130 },
        { pathSuffix: 'e', modificationTime: 14, length: 140 }
      ];
    });

    it('should sort by Name from A to Z', () => {
      event.sorts[0].prop = 'pathSuffix';
      event.sorts[0].dir = 'asc';
      component.handleSortAction(event);
      expect(component.rows).toEqual([
        { pathSuffix: '..', type: FILE_TYPES.DIRECTORY },
        { pathSuffix: 'a', modificationTime: 10, length: 100 },
        { pathSuffix: 'b', modificationTime: 11, length: 110 },
        { pathSuffix: 'c', modificationTime: 12, length: 120 },
        { pathSuffix: 'd', modificationTime: 13, length: 130 },
        { pathSuffix: 'e', modificationTime: 14, length: 140 }
      ]);
    });

    it('should sort by Name from Z to A', () => {
      event.sorts[0].prop = 'pathSuffix';
      component.handleSortAction(event);
      expect(component.rows).toEqual([
        { pathSuffix: '..', type: FILE_TYPES.DIRECTORY },
        { pathSuffix: 'e', modificationTime: 14, length: 140 },
        { pathSuffix: 'd', modificationTime: 13, length: 130 },
        { pathSuffix: 'c', modificationTime: 12, length: 120 },
        { pathSuffix: 'b', modificationTime: 11, length: 110 },
        { pathSuffix: 'a', modificationTime: 10, length: 100 }
      ]);
    });

    it('should sort by Last Modified from new to old', () => {
      event.sorts[0].prop = 'modificationTime';
      event.sorts[0].dir = 'asc';
      component.handleSortAction(event);
      expect(component.rows).toEqual([
        { pathSuffix: '..', type: FILE_TYPES.DIRECTORY },
        { pathSuffix: 'a', modificationTime: 10, length: 100 },
        { pathSuffix: 'b', modificationTime: 11, length: 110 },
        { pathSuffix: 'c', modificationTime: 12, length: 120 },
        { pathSuffix: 'd', modificationTime: 13, length: 130 },
        { pathSuffix: 'e', modificationTime: 14, length: 140 }
      ]);
    });

    it('should sort by Last Modified from old to new', () => {
      event.sorts[0].prop = 'modificationTime';
      component.handleSortAction(event);
      expect(component.rows).toEqual([
        { pathSuffix: '..', type: FILE_TYPES.DIRECTORY },
        { pathSuffix: 'e', modificationTime: 14, length: 140 },
        { pathSuffix: 'd', modificationTime: 13, length: 130 },
        { pathSuffix: 'c', modificationTime: 12, length: 120 },
        { pathSuffix: 'b', modificationTime: 11, length: 110 },
        { pathSuffix: 'a', modificationTime: 10, length: 100 }
      ]);
    });

    it('should sort by Size from smaller to bigger', () => {
      event.sorts[0].prop = 'modificationTime';
      event.sorts[0].dir = 'asc';
      component.handleSortAction(event);
      expect(component.rows).toEqual([
        { pathSuffix: '..', type: FILE_TYPES.DIRECTORY },
        { pathSuffix: 'a', modificationTime: 10, length: 100 },
        { pathSuffix: 'b', modificationTime: 11, length: 110 },
        { pathSuffix: 'c', modificationTime: 12, length: 120 },
        { pathSuffix: 'd', modificationTime: 13, length: 130 },
        { pathSuffix: 'e', modificationTime: 14, length: 140 }
      ]);
    });

    it('should sort by Size from bigger to smaller', () => {
      event.sorts[0].prop = 'length';
      component.handleSortAction(event);
      expect(component.rows).toEqual([
        { pathSuffix: '..', type: FILE_TYPES.DIRECTORY },
        { pathSuffix: 'e', modificationTime: 14, length: 140 },
        { pathSuffix: 'd', modificationTime: 13, length: 130 },
        { pathSuffix: 'c', modificationTime: 12, length: 120 },
        { pathSuffix: 'b', modificationTime: 11, length: 110 },
        { pathSuffix: 'a', modificationTime: 10, length: 100 }
      ]);
    });

    it('should not add "return to parent folder" when in root folder', () => {
      component.rows = [
        { pathSuffix: 'a', modificationTime: 10, length: 100 }
      ];
      component['currentDirectory$'].next('/');
      component.handleSortAction(event);
      expect(component.rows).toEqual([
        { pathSuffix: 'a', modificationTime: 10, length: 100 }
      ]);
    });

    it('should add "return to parent folder" when in root folder', () => {
      component.rows = [
        { pathSuffix: 'a', modificationTime: 10, length: 100 }
      ];
      component['currentDirectory$'].next('test');
      component.handleSortAction(event);
      expect(component.rows).toEqual([
        { pathSuffix: '..', type: FILE_TYPES.DIRECTORY },
        { pathSuffix: 'a', modificationTime: 10, length: 100 }
      ]);
    });
  });

  describe('#convertPermissions', () => {
    it('should return converted permission when row type is directory', () => {
      const result = component.convertPermissions('rwxrwxrwx', FILE_TYPES.DIRECTORY);
      expect(result).toEqual('drwxrwxrwx');
    });

    it('should return converted permission when row type is file', () => {
      const result = component.convertPermissions('rwxrwxrwx', FILE_TYPES.FILE);
      expect(result).toEqual('-rwxrwxrwx');
    });

    it('should return converted permission when row type is incorrect', () => {
      const result = component.convertPermissions('rwxrwxrwx', 'incorrect_type');
      expect(result).toEqual('-rwxrwxrwx');
    });
  });
});
