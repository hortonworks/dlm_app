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

    doVisualizeData(columnName) {
      const meta = {
        'streetaddress': {
          type: 'MAP',
          getData: () => []
        },
        'city': {
          type: 'MAP',
          getData: () => []
        },
        'state': {
          type: 'MAP',
          // show states ?
          getData: () => []
        },
        'statefull': {
          type: 'MAP',
          // show states ?
          getData: () => []
        },
        'zipcode': {
          type: 'MAP',
          getData: () => []
        },
        'customer_city': {
          type: 'MAP',
          getData: () => []
        },
        'customer_state': {
          type: 'MAP',
          getData: () => []
        },
        'customer_zip': {
          type: 'MAP',
          getData: () => []
        },
        'eyecolor': {
          type: 'PIE',
          // use colors for chart
          getData: () => []
        },
        'customer_gender': {
          type: 'PIE',
          getData: getGenderData
        },
        'gender': {
          type: 'PIE',
          getData: getGenderData
        },
        'title': {
          type: 'PIE',
          getData: () => {
            const titles = ['Mr', 'Mrs', 'Miss'];
            let remaining = 100;

            return titles.map((cTitle, index) => {
              const multiplier = index < titles.length ? Math.random() : 1;
              const percent = Math.random() * remaining;
              remaining = remaining - percent;
              return ({
                title: cTitle,
                percent: percent
              });
            });
          }
        },
        'bloodtype': {
          type: 'PIE',
          getData: () => {
            const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'OTHERS'];
            let remaining = 100;

            return groups.map((cGroup, index) => {
              const multiplier = index < groups.length ? Math.random() : 1;
              const percent = Math.random() * remaining;
              remaining = remaining - percent;
              return ({
                group: cGroup,
                percent: percent
              });
            });
          }
        },
        'birthday': {
          type: 'BAR',
          getData: () => {
            const birthdays = [];
            for(let i = 0; i < 100 ; i++) {
              const year = 8 + Math.round(Math.random() * 85);
              const timeOfYear = Math.round(Math.random() * 365 * 24 * 60 * 60 * 1000);

              const instant = (new Date(year, 0, 0)).getTime() + timeOfYear;

              birthdays.push(new Date(instant));
            }

            return birthdays;
          }
        },
        'age': {
          type: 'BAR',
          getData: () => {
            const ages = [];
            for(let i = 0; i < 100 ; i++) {
              const year = 8 + Math.round(Math.random() * 85);
              ages.push(year);
            }

            return ages;
          }
        },
        'occupation': {
          type: 'BAR',
          getData: () => []
        },
        'weight': {
          type: 'BAR',
          getData: () => []
        },
        'height': {
          type: 'BAR',
          getData: () => []
        },
      };

      meta[columnName];

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

function getGenderData() {
  const dataMale = Math.random() * 75;

  return ([{
    type: 'MALE',
    percent: dataMale
  },{
    type: 'FEMALE',
    percent: 100 - 0.62 - dataMale
  }, {
    type: 'OTHERS',
    percent: 0.62
  }]);
}
