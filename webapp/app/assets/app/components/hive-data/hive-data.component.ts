import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AtlasService} from '../../services/atlas.service';
import {DataCenterService} from '../../services/data-center.service';
import {DataCenter} from '../../models/data-center';
import {CityNames} from '../../common/utils/city-names';
import Rx from 'rxjs/Rx';

declare var Datamap:any;
declare var moment:any;
declare var nv: any;
declare var d3: any;

export enum Tab { PROPERTIES, TAGS, AUDITS, SCHEMA, ACCESS_POLICIES}

@Component({
    selector: 'hive-data',
    styleUrls: ['assets/app/components/hive-data/hive-data.component.css'],
    templateUrl: 'assets/app/components/hive-data/hive-data.component.html'
})
export class HiveDataComponent implements OnChanges {
    tab = Tab;
    activeTab: Tab = Tab.PROPERTIES;
    visType: string = 'NONE';

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

      (<any>window).draw = key => this.doVisualizeData(key);
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
          getData: () => {
            const COLORS = ['Black', 'Brown', 'Green', 'Other'];
            let remaining = 100;

            const data =
                COLORS.map((cColor, index) => {
                  const multiplier = index < COLORS.length ? Math.random() : 1;
                  const percent = Math.random() * remaining;
                  remaining = remaining - percent;
                  return ({
                    label: cColor,
                    value: percent
                  });
                });

            return data;
          }
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

            const data =
                titles.map((cTitle, index) => {
                  const multiplier = index < titles.length ? Math.random() : 1;
                  const percent = Math.random() * remaining;
                  remaining = remaining - percent;
                  return ({
                    label: cTitle,
                    value: percent
                  });
                });

            return data;
          }
        },
        'bloodtype': {
          type: 'PIE',
          getData: () => {
            const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'OTHERS'];
            let remaining = 100;

            const data =
              groups.map((cGroup, index) => {
                const multiplier = index < groups.length ? Math.random() : 1;
                const percent = Math.random() * remaining;
                remaining = remaining - percent;
                return ({
                  label: cGroup,
                  value: percent
                });
              });

            return data;
          }
        },
        'birthday': {
          type: 'BAR',
          getData: () => {
            const birthdays: Date[] = [];
            for(let i = 0; i < 100 ; i++) {
              const year = 8 + Math.round(Math.random() * 85);
              const timeOfYear = Math.round(Math.random() * 365 * 24 * 60 * 60 * 1000);

              const instant = (new Date(year, 0, 0)).getTime() + timeOfYear;

              birthdays.push(new Date(instant));
            }

            const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            const data =
              birthdays
                .reduce((accumulator, cBirthday) => {
                  const month = cBirthday.getMonth();
                  accumulator[month] = accumulator[month] && !Number.isNaN(accumulator[month]) ? accumulator[month] + 1 : 1;
                  return accumulator;
                }, [])
                .map((cCountOfMonth, index) => ({
                  label: MONTHS[index],
                  value: cCountOfMonth
                }));

            return ({
              key: 'Birthdays',
              values: data
            });
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

            const ranges = [
              [0, 10], [11, 20], [21, 30], [31, 40], [41, 50], [51, 60], [61, 70], [71, 80], [81, 90], [91, 100]
            ];

            const data =
              ranges.map(cRange => {
                const ageCountInRange =
                  ages.filter(cAge => {
                    return cAge > cRange[0] && cAge < cRange[1];
                  }).length;

                  return ({
                    label: `${cRange[0]}-${cRange[1]}`,
                    value: ageCountInRange,
                  });
              });

            return ({
              key: 'Ages',
              values: data
            });
          }
        },
        'occupation': {
          type: 'BAR',
          getData: () => {
            const OCCUPATIONS = ['Legal', 'Medical', 'Engineering', 'Government', 'Other'];
            const occupations = [];
            for(let i = 0; i < 100 ; i++) {
              const index = Math.floor(Math.random() * 5);
              occupations.push(OCCUPATIONS[index]);
            }

            const dataObj =
              occupations
                .reduce((accumulator, cOccupation) => {
                  accumulator[cOccupation] = accumulator[cOccupation] && !Number.isNaN(accumulator[cOccupation]) ? accumulator[cOccupation] + 1 : 1;
                  return accumulator;
                }, {});
            const data =
              Object
                .keys(dataObj)
                .map((dataObjKey, index) => ({
                  label: dataObjKey,
                  value: dataObj[dataObjKey]
                }));

            return ({
              key: 'Occupations',
              values: data
            });
          }
        },
        'weight': {
          type: 'BAR',
          getData: () => {
            const weights = [];
            for(let i = 0; i < 100 ; i++) {
              const weight = 8 + Math.random() * 110;
              weights.push(weight);
            }

            const ranges = [
              [0, 10], [11, 20], [21, 30], [31, 40], [41, 50], [51, 60], [61, 70], [71, 80], [81, 90], [91, 100], [101, 110], [111, 120]
            ];

            const data =
              ranges.map(cRange => {
                const weightCountInRange =
                  weights.filter(cWeight => {
                    return cWeight > cRange[0] && cWeight < cRange[1];
                  }).length;

                  return ({
                    label: `${cRange[0]}-${cRange[1]}`,
                    value: weightCountInRange,
                  });
              });

            return ({
              key: 'Weights',
              values: data
            });
          }
        },
        'height': {
          type: 'BAR',
          getData: () => {
            const heights = [];
            for(let i = 0; i < 100 ; i++) {
              const height = 40 + Math.random() * 170;
              heights.push(height);
            }

            const ranges = [
              [31, 40], [41, 50], [51, 60], [61, 70], [71, 80], [81, 90], [91, 100], [101, 110], [111, 120], [121, 130], [131, 140], [141, 150], [151, 160], [161, 170], [171, 180], [181, 190], [191, 200], [201, 210]
            ];

            const data =
              ranges.map(cRange => {
                const heightCountInRange =
                  heights.filter(cHeight => {
                    return cHeight > cRange[0] && cHeight < cRange[1];
                  }).length;

                  return ({
                    label: `${cRange[0]}-${cRange[1]}`,
                    value: heightCountInRange,
                  });
              });

            return ({
              key: 'Heights',
              values: data
            });
          }
        },
      };

      const vData = meta[columnName];
      this.visType = vData && vData.type && ['BAR', 'PIE', 'MAP'].indexOf(vData.type) >= 0 ? vData.type : 'NONE';
      switch(this.visType) {
        case 'BAR':
          this.drawBar('#atlas_vis', vData.getData());
          break;
        case 'PIE':
          this.drawPie('#atlas_vis', vData.getData());
          break;
        case 'MAP':
          // this.isMapActive = false;
          // this.drawBar('#atlas_graph', vData.getData());
          // break;
        default:
          // do nothing
      }
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

    drawBar(domSelector, data) {
      d3.selectAll(`${domSelector} > *`).remove();
      nv.addGraph(() => {
        const chart = nv.models.discreteBarChart()
          .x(d => d.label)
          .y(d => d.value)
          .height(250)
          .width(450)
          .staggerLabels(true)
          .showValues(true)
          .duration(350);

        chart.yAxis.tickFormat(d3.format('d'));

        d3
          .select(domSelector)
          .datum([data])
          .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      });
    }

    drawPie(domSelector, data) {
      d3.selectAll(`${domSelector} > *`).remove();
      nv.addGraph(() => {
        const chart = nv.models.pieChart()
            .x(d => d.label)
            .y(d => d.value)
            .showLabels(true);

        d3
          .select(domSelector)
          .datum(data)
          .transition()
          .duration(350)
          .call(chart);

        return chart;
      });
    }
}

function getGenderData() {
  const dataMale = Math.random() * 75;

  return ([{
    label: 'MALE',
    value: dataMale
  },{
    label: 'FEMALE',
    value: 100 - 0.62 - dataMale
  }, {
    label: 'OTHERS',
    value: 0.62
  }]);
}
