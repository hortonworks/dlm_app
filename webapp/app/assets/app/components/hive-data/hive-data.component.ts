import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AtlasService} from '../../services/atlas.service';
import {DataCenterService} from '../../services/data-center.service';
import {DataCenter} from '../../models/data-center';
import {CityNames} from '../../common/utils/city-names';
import Rx from 'rxjs/Rx';

declare var Datamap:any;
declare var moment:any;

export enum Tab { PROPERTIES, TAGS, AUDITS, SCHEMA, ACCESS_POLICIES}

@Component({
    selector: 'hive-data',
    styleUrls: ['assets/app/components/hive-data/hive-data.component.css'],
    templateUrl: 'assets/app/components/hive-data/hive-data.component.html'
})
export class HiveDataComponent implements OnChanges {
    tab = Tab;
    activeTab: Tab = Tab.PROPERTIES;

    map: any;

    rxDataLakeId: Rx.Subject<string> = new Rx.Subject<string>();
    rxResource: Rx.Subject<{
      resourceId: string,
      resourceType: string
    }> = new Rx.Subject<{
      resourceId: string,
      resourceType: string
    }>();

    properties: any[] = [];
    schema: any[] = [];
    auditEvents: any[] = [];
    tags: any[] = [];


    @Input()
    resourceId: string = '';
    @Input()
    resourceType: string = '';
    @Input()
    dataLakeId: string = '';
    @Input()
    clusterId: string = '';

    constructor(
      private atlasService: AtlasService,
      private dcService: DataCenterService
    ) {

      const rxTable =
        this.rxResource
          .filter(resource => Boolean(resource.resourceId && resource.resourceType))
          .flatMap(resource => atlasService.getTable(this.clusterId, this.dataLakeId, resource.resourceId));

      rxTable
        .subscribe(table => {
          this.schema =
            table.columns.map(cColumn => ({
              name: cColumn.name,
              owner: cColumn.owner,
              type: cColumn.type,
              tags: cColumn.tags || []
            }));
        });

      rxTable
        .flatMap(table => atlasService.getAudit(this.clusterId, this.dataLakeId, table['$id$'].id))
        .subscribe(audits => this.auditEvents = audits.events);

      const rxEntity =
        rxTable
          .flatMap(table => atlasService.getEntity(this.clusterId, this.dataLakeId, table['$id$'].id));

      rxEntity
        .map(entity => Object.keys(entity.definition.traits).map(cTraitKey => entity.definition.traits[cTraitKey]))
        .subscribe(tags => this.tags = tags);

      rxEntity
        .map(entity => {
          const paramsA =
            Object.keys(entity.definition.values)
              .filter(cValueKey => ['db', 'columns', 'sd', 'parameters'].indexOf(cValueKey) === -1)
              .map(cValueKey => ({
                key: cValueKey,
                value: entity.definition.values[cValueKey]
              }));

          const paramsB =
            Object.keys(entity.definition.values.parameters)
              .map(cValueKey => ({
                key: cValueKey,
                value: entity.definition.values.parameters[cValueKey]
              }));

          return ([
            ...paramsA,
            ...paramsB,
            {
              key: 'numColumns',
              value: entity.definition.values.columns.length
            }
          ]);
        })
        .subscribe(properties => this.properties = properties);

      this.rxDataLakeId
        .flatMap(dataLakeId => dcService.getById(dataLakeId))
        .map(dataLake => dataLake.location)
        .subscribe(location => this.drawMap(location));

    }

    ngOnChanges(changes: SimpleChanges) {
      if(changes['dataLakeId'] && changes['dataLakeId'].currentValue) {
        this.dataLakeId = changes['dataLakeId'].currentValue;

        this.rxDataLakeId.next(changes['dataLakeId'].currentValue);
      }

      if(changes['clusterId'] && changes['clusterId'].currentValue) {
        this.clusterId = changes['clusterId'].currentValue;
      }

      if (
        changes['resourceId'] && changes['resourceId'].currentValue
        || changes['resourceType'] && changes['resourceType'].currentValue
      ) {
        this.rxResource.next({
          resourceId: this.resourceId,
          resourceType: this.resourceType,
        });
      }
    }

    setActiveTab($event: any, activeTab: Tab) {
        this.activeTab = activeTab;
        $event.preventDefault();
    }

    doGetMomentFromTimestamp(timestamp) {
      return moment(timestamp).fromNow();
    }

    drawMap(location) {
      this.map = new Datamap({
        element: document.getElementById('mapcontainer-hive'),
        height: 273,
        width: 385,
        projection: 'mercator',
        fills: {
          defaultFill: '#676966'
        },
        bubblesConfig: {
          borderWidth: '2',
          borderColor: '#FFFFFF',
          popupOnHover: false,
          highlightOnHover: true
        },
        geographyConfig: {
          popupOnHover: false,
          highlightOnHover: true
        }
      });
      const position = CityNames.getCityCoordinates(location.country, location.place);
      this.map.bubbles([{
        radius: 5,
        latitude: position[0],
        longitude: position[1]
      }], {});
    }
}
