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

      // this.rxDataLakeId
      //   .flatMap(dataLakeId => dcService.getById(dataLakeId))
      //   .map(dataLake => dataLake.location)
      //   .subscribe(location => this.drawMap(location));

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
      d3.selectAll('.nvtooltip').remove();
      switch(this.visType) {
        case 'BAR':
          this.drawBar('#atlas_vis', vData.getData());
          break;
        case 'PIE':
          this.drawPie('#atlas_vis', vData.getData());
          break;
        case 'MAP':
          this.drawMap('#mapcontainer_hive', getRandomLocations());
          break;
        default:
          // do nothing
      }
    }

    drawMap(domSelector, bubbles) {
      d3.selectAll(`${domSelector} > *`).remove();

      this.map = new Datamap({
        element: d3.select(domSelector).node(),
        height: 273,
        width: 385,
        projection: 'mercator',
        fills: {
          defaultFill: '#676966'
        },
        bubblesConfig: {
          radius: 3,
          fillColor: 'rgb(61, 189, 235)',
          fillOpacity: 0.95,
          borderWidth: 0,
          highlightOnHover: true
        },
        geographyConfig: {
          popupOnHover: false,
          highlightOnHover: false
        }
      });

      this.map.bubbles(bubbles, {fillColor: 'rgb(61, 189, 235)'});
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

function getRandomLocations() {
  const remainder = Math.floor(Math.random() * 10);
  return getAirports().filter((cAirport, index) => index % 10 === remainder);
}

function getAirports() {
  return JSON.parse('[{"latitude":"18.010702","longitude":"-66.563545","name":"Areopuerto Internacional Michael Gonzalez"},{"latitude":"11.033333","longitude":"20.283333","name":null},{"latitude":"-9.444308","longitude":"147.21446","name":"Port Moresby Jacksons International Airport"},{"latitude":"63.997765","longitude":"-22.624283","name":"Keflavik International Airport"},{"latitude":"42.573612","longitude":"21.035557","name":null},{"latitude":"53.307377","longitude":"-113.584045","name":"Edmonton International Airport"},{"latitude":"44.88496","longitude":"-63.51425","name":"Halifax / Stanfield International Airport"},{"latitude":"45.32083","longitude":"-75.672775","name":"Ottawa Macdonald-Cartier International Airport"},{"latitude":"46.792038","longitude":"-71.383385","name":"Quebec Jean Lesage International Airport"},{"latitude":"45.457714","longitude":"-73.74991","name":"Montreal / Pierre Elliott Trudeau International Airport"},{"latitude":"49.1947","longitude":"-123.17919","name":"Vancouver International Airport"},{"latitude":"49.9","longitude":"-97.23333","name":"Winnipeg / James Armstrong Richardson International Airport"},{"latitude":"43.02802","longitude":"-81.14965","name":"London Airport"},{"latitude":"51.131393","longitude":"-114.01055","name":"Calgary International Airport"},{"latitude":"48.640266","longitude":"-123.43096","name":"Victoria International Airport"},{"latitude":"43.681583","longitude":"-79.61146","name":"Lester B. Pearson International Airport"},{"latitude":"36.70058","longitude":"3.21167","name":"Houari Boumediene Airport"},{"latitude":"5.60737","longitude":"-0.171769","name":"Kotoka International Airport"},{"latitude":"9.004614","longitude":"7.270447","name":"Nnamdi Azikiwe International Airport"},{"latitude":"6.577871","longitude":"3.321178","name":"Murtala Muhammed International Airport"},{"latitude":"36.847622","longitude":"10.21709","name":"Tunis Carthage International Airport"},{"latitude":"50.89717","longitude":"4.483602","name":"Brussels Airport"},{"latitude":"50.643333","longitude":"5.460149","name":null},{"latitude":"52.370277","longitude":"13.521388","name":null},{"latitude":"51.124332","longitude":"13.766082","name":"Dresden Airport"},{"latitude":"50.050735","longitude":"8.570773","name":"Frankfurt am Main International Airport"},{"latitude":"52.130054","longitude":"7.694928","name":"Muenster Osnabrueck Airport"},{"latitude":"53.63128","longitude":"10.006414","name":"Hamburg Airport"},{"latitude":"50.878365","longitude":"7.122224","name":"Cologne Bonn Airport"},{"latitude":"51.278328","longitude":"6.76558","name":"Dusseldorf International Airport"},{"latitude":"48.353004","longitude":"11.790143","name":"Munich International Airport"},{"latitude":"49.494167","longitude":"11.077062","name":"Nuremberg Airport"},{"latitude":"51.42026","longitude":"12.221202","name":"Leipzig Halle Airport"},{"latitude":"48.69073","longitude":"9.193624","name":"Stuttgart Airport"},{"latitude":"52.553944","longitude":"13.291722","name":"Berlin-Tegel International Airport"},{"latitude":"52.459255","longitude":"9.694766","name":"Hannover Airport"},{"latitude":"53.05297","longitude":"8.785352","name":"Bremen Airport"},{"latitude":"51.514828","longitude":"7.613139","name":"Dortmund Airport"},{"latitude":"48.781033","longitude":"8.089752","name":"Karlsruhe Baden-Baden Airport"},{"latitude":"59.416622","longitude":"24.798702","name":"Tallinn Airport"},{"latitude":"60.31795","longitude":"24.96645","name":"Helsinki Vantaa Airport"},{"latitude":"54.662395","longitude":"-6.217616","name":"Belfast International Airport"},{"latitude":"54.61452","longitude":"-5.870215","name":"George Best Belfast City Airport"},{"latitude":"52.45252","longitude":"-1.733256","name":"Birmingham International Airport"},{"latitude":"53.362907","longitude":"-2.273354","name":"Manchester Airport"},{"latitude":"53.481003","longitude":"-1.01155","name":"Robin Hood Doncaster Sheffield Airport"},{"latitude":"51.39877","longitude":"-3.339075","name":"Cardiff International Airport"},{"latitude":"51.386757","longitude":"-2.710659","name":"Bristol International Airport"},{"latitude":"53.337616","longitude":"-2.854905","name":"Liverpool John Lennon Airport"},{"latitude":"51.87977","longitude":"-0.376232","name":"London Luton Airport"},{"latitude":"50.77827","longitude":"-1.832476","name":"Bournemouth Airport"},{"latitude":"50.950726","longitude":"-1.361318","name":"Southampton Airport"},{"latitude":"51.156807","longitude":"-0.161863","name":"London Gatwick Airport"},{"latitude":"51.5","longitude":"0.05","name":"London City Airport"},{"latitude":"51.469604","longitude":"-0.453566","name":"London Heathrow Airport"},{"latitude":"53.86934","longitude":"-1.659985","name":"Leeds Bradford Airport"},{"latitude":"55.037064","longitude":"-1.710629","name":"Newcastle Airport"},{"latitude":"52.82587","longitude":"-1.330595","name":"East Midlands Airport"},{"latitude":"57.200253","longitude":"-2.204186","name":"Aberdeen Dyce Airport"},{"latitude":"55.864212","longitude":"-4.431782","name":"Glasgow International Airport"},{"latitude":"55.948143","longitude":"-3.364177","name":"Edinburgh Airport"},{"latitude":"51.889267","longitude":"0.262703","name":"London Stansted Airport"},{"latitude":"50.73111","longitude":"-3.410968","name":"Exeter International Airport"},{"latitude":"52.49167","longitude":"0.67609","name":"RAF Lakenheath"},{"latitude":"52.36667","longitude":"0.483333","name":"RAF Mildenhall"},{"latitude":"51.733334","longitude":"-1.783333","name":"RAF Fairford"},{"latitude":"51.75","longitude":"-1.587093","name":"RAF Brize Norton"},{"latitude":"52.30907","longitude":"4.763385","name":"Amsterdam Airport Schiphol"},{"latitude":"50.91562","longitude":"5.768827","name":"Maastricht Aachen Airport"},{"latitude":"51.457954","longitude":"5.391795","name":"Eindhoven Airport"},{"latitude":"51.846645","longitude":"-8.48914","name":"Cork Airport"},{"latitude":"53.42728","longitude":"-6.24357","name":"Dublin Airport"},{"latitude":"52.69248","longitude":"-8.92039","name":"Shannon Airport"},{"latitude":"55.747383","longitude":"9.147874","name":"Billund Airport"},{"latitude":"55.62905","longitude":"12.647601","name":"Copenhagen Kastrup Airport"},{"latitude":"57.08655","longitude":"9.872241","name":"Aalborg Airport"},{"latitude":"49.63111","longitude":"6.209539","name":"Luxembourg-Findel International Airport"},{"latitude":"67.27262","longitude":"14.367839","name":null},{"latitude":"60.289062","longitude":"5.228169","name":"Bergen Airport, Flesland"},{"latitude":"60.19419","longitude":"11.100411","name":"Oslo Gardermoen Airport"},{"latitude":"69.67983","longitude":"18.907343","name":null},{"latitude":"63.454285","longitude":"10.917863","name":null},{"latitude":"58.88215","longitude":"5.629197","name":"Stavanger Airport, Sola"},{"latitude":"54.380978","longitude":"18.468655","name":"Gda?sk Lech Wa??sa Airport"},{"latitude":"50.075493","longitude":"19.793743","name":null},{"latitude":"52.170906","longitude":"20.97329","name":"Warsaw Chopin Airport"},{"latitude":"57.66664","longitude":"12.294878","name":"Gothenburg-Landvetter Airport"},{"latitude":"55.538757","longitude":"13.363727","name":null},{"latitude":"65.54939","longitude":"22.123587","name":null},{"latitude":"59.64982","longitude":"17.930365","name":"Stockholm-Arlanda Airport"},{"latitude":"49.439938","longitude":"7.599187","name":"Ramstein Air Base"},{"latitude":"56.92208","longitude":"23.979807","name":"Riga International Airport"},{"latitude":"54.643078","longitude":"25.279606","name":"Vilnius International Airport"},{"latitude":"-33.968906","longitude":"18.596489","name":"Cape Town International Airport"},{"latitude":"-34.00148","longitude":"22.382235","name":"George Airport"},{"latitude":"-26.132664","longitude":"28.231314","name":"OR Tambo International Airport"},{"latitude":"-29.614445","longitude":"31.116388","name":"King Shaka International Airport"},{"latitude":"27.938944","longitude":"-15.389351","name":"Gran Canaria Airport"},{"latitude":"28.044443","longitude":"-16.5725","name":"Tenerife South Airport"},{"latitude":"28.488056","longitude":"-16.345982","name":"Tenerife Norte Airport"},{"latitude":"33.36667","longitude":"-7.586667","name":"Mohammed V International Airport"},{"latitude":"14.744975","longitude":"-17.490194","name":null},{"latitude":"30.120106","longitude":"31.40647","name":"Cairo International Airport"},{"latitude":"27.189156","longitude":"33.8055","name":"Hurghada International Airport"},{"latitude":"-1.319167","longitude":"36.92578","name":"Jomo Kenyatta International Airport"},{"latitude":"-4.0327","longitude":"39.60325","name":"Mombasa Moi International Airport"},{"latitude":"32.66989","longitude":"13.144279","name":"Tripoli International Airport"},{"latitude":"15.592217","longitude":"32.549698","name":"Khartoum International Airport"},{"latitude":"35.049625","longitude":"-106.617195","name":"Albuquerque International Sunport Airport"},{"latitude":"38.816666","longitude":"-76.86667","name":"Andrews Air Force Base"},{"latitude":"32.986668","longitude":"-97.316666","name":"Fort Worth Alliance Airport"},{"latitude":"33.373665","longitude":"-81.973434","name":"Augusta Regional At Bush Field"},{"latitude":"35.218273","longitude":"-101.70513","name":"Rick Husband Amarillo International Airport"},{"latitude":"33.640068","longitude":"-84.44403","name":"Hartsfield Jackson Atlanta International Airport"},{"latitude":"30.202545","longitude":"-97.66706","name":"Austin Bergstrom International Airport"},{"latitude":"35.43508","longitude":"-82.537315","name":"Asheville Regional Airport"},{"latitude":"39.15","longitude":"-121.583336","name":"Beale Air Force Base"},{"latitude":"32.5","longitude":"-93.666664","name":"Barksdale Air Force Base"},{"latitude":"41.92953","longitude":"-72.6847","name":"Bradley International Airport"},{"latitude":"47.5371","longitude":"-122.3037","name":"Boeing Field King County International Airport"},{"latitude":"44.812298","longitude":"-68.82102","name":"Bangor International Airport"},{"latitude":"33.560833","longitude":"-86.75219","name":"Birmingham-Shuttlesworth International Airport"},{"latitude":"45.803417","longitude":"-108.53723","name":"Billings Logan International Airport"},{"latitude":"40.48401","longitude":"-88.91483","name":"Central Illinois Regional Airport at Bloomington-Normal"},{"latitude":"36.13174","longitude":"-86.668945","name":"Nashville International Airport"},{"latitude":"43.569263","longitude":"-116.22193","name":"Boise Air Terminal/Gowen field"},{"latitude":"42.36646","longitude":"-71.02018","name":"General Edward Lawrence Logan International Airport"},{"latitude":"30.532537","longitude":"-91.156906","name":"Baton Rouge Metropolitan, Ryan Field"},{"latitude":"42.933826","longitude":"-78.731804","name":"Buffalo Niagara International Airport"},{"latitude":"39.179527","longitude":"-76.66894","name":"Baltimore/Washington International Thurgood Marshal Airport"},{"latitude":"33.946907","longitude":"-81.12501","name":"Columbia Metropolitan Airport"},{"latitude":"35.036926","longitude":"-85.197784","name":"Lovell Field"},{"latitude":"32.884354","longitude":"-80.037155","name":"Charleston Air Force Base-International Airport"},{"latitude":"41.889423","longitude":"-91.7003","name":"The Eastern Iowa Airport"},{"latitude":"41.410854","longitude":"-81.83821","name":"Cleveland Hopkins International Airport"},{"latitude":"35.219166","longitude":"-80.93584","name":"Charlotte Douglas International Airport"},{"latitude":"39.99818","longitude":"-82.884964","name":"Port Columbus International Airport"},{"latitude":"38.79713","longitude":"-104.70056","name":"City of Colorado Springs Municipal Airport"},{"latitude":"42.90861","longitude":"-106.4625","name":"Casper-Natrona County International Airport"},{"latitude":"27.774813","longitude":"-97.50249","name":"Corpus Christi International Airport"},{"latitude":"38.370342","longitude":"-81.596504","name":"Yeager Airport"},{"latitude":"39.0555","longitude":"-84.66145","name":"Cincinnati Northern Kentucky International Airport"},{"latitude":"32.84391","longitude":"-96.85","name":"Dallas Love Field"},{"latitude":"39.898006","longitude":"-84.220764","name":"James M Cox Dayton International Airport"},{"latitude":"42.41","longitude":"-90.71083","name":"Dubuque Regional Airport"},{"latitude":"38.853436","longitude":"-77.04346","name":"Ronald Reagan Washington National Airport"},{"latitude":"39.84939","longitude":"-104.672844","name":"Denver International Airport"},{"latitude":"32.89746","longitude":"-97.036125","name":"Dallas Fort Worth International Airport"},{"latitude":"46.838974","longitude":"-92.18019","name":"Duluth International Airport"},{"latitude":"41.532433","longitude":"-93.64809","name":"Des Moines International Airport"},{"latitude":"42.20781","longitude":"-83.35605","name":"Detroit Metropolitan Wayne County Airport"},{"latitude":"42.08314","longitude":"-80.18203","name":"Erie International Tom Ridge Field"},{"latitude":"40.68907","longitude":"-74.17876","name":"Newark Liberty International Airport"},{"latitude":"26.071491","longitude":"-80.144905","name":"Fort Lauderdale Hollywood International Airport"},{"latitude":"35.34124","longitude":"-94.3589","name":"Fort Smith Regional Airport"},{"latitude":"32.75","longitude":"-97.333336","name":"Fort Worth Meacham International Airport"},{"latitude":"40.98666","longitude":"-85.18771","name":"Fort Wayne International Airport"},{"latitude":"47.62515","longitude":"-117.537636","name":"Spokane International Airport"},{"latitude":"30.413284","longitude":"-89.07203","name":"Gulfport Biloxi International Airport"},{"latitude":"44.492847","longitude":"-88.121895","name":"Austin Straubel International Airport"},{"latitude":"36.105324","longitude":"-79.9373","name":"Piedmont Triad International Airport"},{"latitude":"34.890568","longitude":"-82.21706","name":"Greenville Spartanburg International Airport"},{"latitude":"47.38861","longitude":"-92.83861","name":"Chisholm Hibbing Airport"},{"latitude":"29.654512","longitude":"-95.277016","name":"William P Hobby Airport"},{"latitude":"34.64857","longitude":"-86.77484","name":"Huntsville International Carl T Jones Field"},{"latitude":"38.366943","longitude":"-82.556114","name":"Tri-State/Milton J. Ferguson Field"},{"latitude":"38.95315","longitude":"-77.44774","name":"Washington Dulles International Airport"},{"latitude":"29.983334","longitude":"-95.34","name":"George Bush Intercontinental Houston Airport"},{"latitude":"37.653046","longitude":"-97.428955","name":"Wichita Mid Continent Airport"},{"latitude":"39.714516","longitude":"-86.29805","name":"Indianapolis International Airport"},{"latitude":"32.309895","longitude":"-90.07496","name":"Jackson Evers International Airport"},{"latitude":"30.491657","longitude":"-81.68306","name":"Jacksonville International Airport"},{"latitude":"40.642334","longitude":"-73.78817","name":"John F Kennedy International Airport"},{"latitude":"37.149723","longitude":"-94.49778","name":"Joplin Regional Airport"},{"latitude":"36.086945","longitude":"-115.1486","name":"McCarran International Airport"},{"latitude":"33.943398","longitude":"-118.40828","name":"Los Angeles International Airport"},{"latitude":"33.65622","longitude":"-101.8223","name":"Lubbock Preston Smith International Airport"},{"latitude":"38.03762","longitude":"-84.59792","name":"Blue Grass Airport"},{"latitude":"30.20851","longitude":"-91.99327","name":"Lafayette Regional Airport"},{"latitude":"40.774254","longitude":"-73.87162","name":"La Guardia Airport"},{"latitude":"34.727432","longitude":"-92.221375","name":"Adams Field"},{"latitude":"43.53339","longitude":"-84.090744","name":"MBS International Airport"},{"latitude":"39.293808","longitude":"-94.719925","name":"Kansas City International Airport"},{"latitude":"28.432177","longitude":"-81.308304","name":"Orlando International Airport"},{"latitude":"41.788136","longitude":"-87.74087","name":"Chicago Midway International Airport"},{"latitude":"35.04458","longitude":"-89.98226","name":"Memphis International Airport"},{"latitude":"32.305042","longitude":"-86.39029","name":"Montgomery Regional (Dannelly Field) Airport"},{"latitude":"42.92786","longitude":"-71.43844","name":"Manchester Airport"},{"latitude":"25.796","longitude":"-80.27824","name":"Miami International Airport"},{"latitude":"42.948093","longitude":"-87.90267","name":"General Mitchell International Airport"},{"latitude":"41.453896","longitude":"-90.50611","name":"Quad City International Airport"},{"latitude":"32.51184","longitude":"-92.043655","name":"Monroe Regional Airport"},{"latitude":"30.681086","longitude":"-88.24475","name":"Mobile Regional Airport"},{"latitude":"43.136375","longitude":"-89.3465","name":"Dane County Regional Truax Field"},{"latitude":"44.883015","longitude":"-93.21092","name":"Minneapolis-St Paul International/Wold-Chamberlain Airport"},{"latitude":"29.984564","longitude":"-90.25639","name":"Louis Armstrong New Orleans International Airport"},{"latitude":"33.682674","longitude":"-78.92294","name":"Myrtle Beach International Airport"},{"latitude":"37.71188","longitude":"-122.21201","name":"Metropolitan Oakland International Airport"},{"latitude":"35.39563","longitude":"-97.59609","name":"Will Rogers World Airport"},{"latitude":"34.06068","longitude":"-117.59765","name":"Ontario International Airport"},{"latitude":"41.976913","longitude":"-87.90488","name":"Chicago O\'Hare International Airport"},{"latitude":"36.898582","longitude":"-76.20629","name":"Norfolk International Airport"},{"latitude":"26.688885","longitude":"-80.09044","name":"Palm Beach International Airport"},{"latitude":"45.588997","longitude":"-122.5929","name":"Portland International Airport"},{"latitude":"37.13033","longitude":"-76.50282","name":"Newport News Williamsburg International Airport"},{"latitude":"39.87641","longitude":"-75.2433","name":"Philadelphia International Airport"},{"latitude":"33.435036","longitude":"-112.00016","name":"Phoenix Sky Harbor International Airport"},{"latitude":"40.66643","longitude":"-89.69012","name":"Greater Peoria Regional Airport"},{"latitude":"40.49585","longitude":"-80.25657","name":"Pittsburgh International Airport"},{"latitude":"43.64749","longitude":"-70.31031","name":"Portland International Jetport Airport"},{"latitude":"35.873592","longitude":"-78.79086","name":"Raleigh Durham International Airport"},{"latitude":"42.30364","longitude":"-89.222115","name":"Chicago Rockford International Airport"},{"latitude":"37.50611","longitude":"-77.3225","name":"Richmond International Airport"},{"latitude":"39.505783","longitude":"-119.775696","name":"Reno Tahoe International Airport"},{"latitude":"37.32051","longitude":"-79.97038","name":"Roanoke Regional Woodrum Field"},{"latitude":"43.127975","longitude":"-77.66543","name":"Greater Rochester International Airport"},{"latitude":"43.910793","longitude":"-92.48977","name":"Rochester International Airport"},{"latitude":"26.542835","longitude":"-81.75433","name":"Southwest Florida International Airport"},{"latitude":"32.731937","longitude":"-117.19731","name":"San Diego International Airport"},{"latitude":"29.524937","longitude":"-98.47264","name":"San Antonio International Airport"},{"latitude":"32.1358","longitude":"-81.21059","name":"Savannah Hilton Head International Airport"},{"latitude":"41.700554","longitude":"-86.31335","name":"South Bend Regional Airport"},{"latitude":"38.186375","longitude":"-85.74179","name":"Louisville International Standiford Field"},{"latitude":"47.44384","longitude":"-122.301735","name":"Seattle Tacoma International Airport"},{"latitude":"28.775118","longitude":"-81.2432","name":"Orlando Sanford International Airport"},{"latitude":"37.615215","longitude":"-122.38988","name":"San Francisco International Airport"},{"latitude":"37.24237","longitude":"-93.38226","name":"Springfield Branson National Airport"},{"latitude":"32.45471","longitude":"-93.828384","name":"Shreveport Regional Airport"},{"latitude":"37.366737","longitude":"-121.92638","name":"Norman Y. Mineta San Jose International Airport"},{"latitude":"40.785645","longitude":"-111.980675","name":"Salt Lake City International Airport"},{"latitude":"38.692284","longitude":"-121.5937","name":"Sacramento International Airport"},{"latitude":"33.680202","longitude":"-117.860535","name":"John Wayne Airport-Orange County Airport"},{"latitude":"39.844166","longitude":"-89.67889","name":"Abraham Lincoln Capital Airport"},{"latitude":"33.988335","longitude":"-98.49194","name":"Sheppard Air Force Base-Wichita Falls Municipal Airport"},{"latitude":"27.38748","longitude":"-82.55328","name":"Sarasota Bradenton International Airport"},{"latitude":"38.74228","longitude":"-90.36587","name":"Lambert St Louis International Airport"},{"latitude":"42.401943","longitude":"-96.38417","name":"Sioux Gateway Col. Bud Day Field"},{"latitude":"43.113983","longitude":"-76.11223","name":"Syracuse Hancock International Airport"},{"latitude":"30.395782","longitude":"-84.34444","name":"Tallahassee Regional Airport"},{"latitude":"41.5925","longitude":"-83.8069","name":"Toledo Express Airport"},{"latitude":"27.97987","longitude":"-82.535416","name":"Tampa International Airport"},{"latitude":"36.48111","longitude":"-82.40785","name":"Tri Cities Regional Tn Va Airport"},{"latitude":"36.189808","longitude":"-95.8901","name":"Tulsa International Airport"},{"latitude":"32.12069","longitude":"-110.93737","name":"Tucson International Airport"},{"latitude":"35.80565","longitude":"-83.98973","name":"McGhee Tyson Airport"},{"latitude":"30.495913","longitude":"-86.54946","name":"Eglin Air Force Base"},{"latitude":"41.419132","longitude":"19.71328","name":"Tirana International Airport Mother Teresa"},{"latitude":"42.56745","longitude":"27.515545","name":"Burgas Airport"},{"latitude":"42.3","longitude":"24.716667","name":"Plovdiv International Airport"},{"latitude":"42.688343","longitude":"23.41443","name":"Sofia Airport"},{"latitude":"43.23726","longitude":"27.829096","name":"Varna Airport"},{"latitude":"34.880867","longitude":"33.62599","name":"Larnaca International Airport"},{"latitude":"34.71155","longitude":"32.489105","name":"Paphos International Airport"},{"latitude":"45.733242","longitude":"16.06152","name":"Zagreb Airport"},{"latitude":"38.287098","longitude":"-0.557381","name":"Alicante International Airport"},{"latitude":"41.30303","longitude":"2.07593","name":"Barcelona International Airport"},{"latitude":"40.46515","longitude":"-3.570209","name":"Madrid Barajas International Airport"},{"latitude":"36.675182","longitude":"-4.489616","name":null},{"latitude":"39.547653","longitude":"2.730388","name":"Palma De Mallorca Airport"},{"latitude":"42.897316","longitude":"-8.420327","name":"Santiago de Compostela Airport"},{"latitude":"44.83102","longitude":"-0.70217","name":null},{"latitude":"43.63007","longitude":"1.374321","name":"Toulouse-Blagnac Airport"},{"latitude":"45.166668","longitude":"1.533333","name":"Brive-La Roche Airport"},{"latitude":"43.44178","longitude":"5.222137","name":"Marseille Provence Airport"},{"latitude":"43.66049","longitude":"7.205232","name":null},{"latitude":"47.432236","longitude":"0.726584","name":"Tours-Val-de-Loire Airport"},{"latitude":"49.003197","longitude":"2.567023","name":"Charles de Gaulle International Airport"},{"latitude":"48.728283","longitude":"2.3597","name":"Paris-Orly Airport"},{"latitude":"37.93635","longitude":"23.946486","name":"Eleftherios Venizelos International Airport"},{"latitude":"35.33663","longitude":"25.174192","name":"Heraklion International Nikos Kazantzakis Airport"},{"latitude":"40.520832","longitude":"22.972221","name":"Thessaloniki Macedonia International Airport"},{"latitude":"47.433037","longitude":"19.261621","name":"Budapest Listz Ferenc international Airport"},{"latitude":"41.13388","longitude":"16.76391","name":"Bari / Palese International Airport"},{"latitude":"37.47066","longitude":"15.065877","name":"Catania / Fontanarossa Airport"},{"latitude":"38.186523","longitude":"13.104779","name":"Palermo / Punta Raisi Airport"},{"latitude":"39.254333","longitude":"9.060673","name":"Cagliari / Elmas Airport"},{"latitude":"45.627403","longitude":"8.71237","name":"Malpensa International Airport"},{"latitude":"45.665314","longitude":"9.698713","name":"Bergamo / Orio Al Serio Airport"},{"latitude":"45.191456","longitude":"7.643049","name":"Torino / Caselle International Airport"},{"latitude":"44.415066","longitude":"8.85081","name":"Genova / Sestri Cristoforo Colombo Airport"},{"latitude":"45.460957","longitude":"9.279157","name":"Linate Airport"},{"latitude":"44.529266","longitude":"11.293289","name":"Bologna / Borgo Panigale Airport"},{"latitude":"45.655113","longitude":"12.204444","name":"Treviso / Sant\'Angelo Airport"},{"latitude":"45.40233","longitude":"10.906796","name":"Verona / Villafranca Airport"},{"latitude":"45.502285","longitude":"12.337947","name":"Venezia / Tessera -  Marco Polo Airport"},{"latitude":"41.799065","longitude":"12.590987","name":"Ciampino Airport"},{"latitude":"41.794594","longitude":"12.250346","name":"Leonardo Da Vinci (Fiumicino) International Airport"},{"latitude":"40.886112","longitude":"14.291667","name":null},{"latitude":"43.69871","longitude":"10.399915","name":"Pisa / San Giusto - Galileo Galilei International Airport"},{"latitude":"46.23102","longitude":"14.454972","name":null},{"latitude":"50.10619","longitude":"14.266638","name":"Ruzyn? International Airport"},{"latitude":"32.000454","longitude":"34.870743","name":"Ben Gurion International Airport"},{"latitude":"29.952015","longitude":"34.9339","name":"Ovda International Airport"},{"latitude":"35.849777","longitude":"14.495401","name":"Luqa Airport"},{"latitude":"48.11972","longitude":"16.563583","name":"Vienna International Airport"},{"latitude":"37.020645","longitude":"-7.968545","name":"Faro Airport"},{"latitude":"38.754074","longitude":"-27.08757","name":"Lajes Field"},{"latitude":"37.743847","longitude":"-25.696468","name":null},{"latitude":"41.237774","longitude":"-8.670272","name":null},{"latitude":"38.770042","longitude":"-9.128165","name":"Lisbon Portela Airport"},{"latitude":"43.826687","longitude":"18.336065","name":"Sarajevo International Airport"},{"latitude":"44.571156","longitude":"26.077063","name":"Henri Coand? International Airport"},{"latitude":"46.229633","longitude":"6.105774","name":"Geneva Cointrin International Airport"},{"latitude":"47.450603","longitude":"8.561746","name":null},{"latitude":"40.11494","longitude":"32.993145","name":"Esenbo?a International Airport"},{"latitude":"36.98503","longitude":"35.29736","name":"Adana Airport"},{"latitude":"36.89928","longitude":"30.80135","name":"Antalya International Airport"},{"latitude":"36.944935","longitude":"37.473747","name":"Gaziantep International Airport"},{"latitude":"38.63333","longitude":"34.716667","name":"Nev?ehir Kapadokya International Airport"},{"latitude":"40.976665","longitude":"28.815277","name":null},{"latitude":"38.294403","longitude":"27.147594","name":"Adnan Menderes International Airport"},{"latitude":"36.717552","longitude":"28.794546","name":"Dalaman International Airport"},{"latitude":"39.955555","longitude":"41.17361","name":"Erzurum International Airport"},{"latitude":"40.99419","longitude":"39.78168","name":"Trabzon International Airport"},{"latitude":"37.86611","longitude":"30.382221","name":null},{"latitude":"37.243954","longitude":"27.672781","name":"Milas Bodrum International Airport"},{"latitude":"40.904675","longitude":"29.309189","name":null},{"latitude":"44.819443","longitude":"20.306944","name":"Belgrade Nikola Tesla Airport"},{"latitude":"42.368023","longitude":"19.246023","name":"Podgorica Airport"},{"latitude":"48.170017","longitude":"17.199799","name":null},{"latitude":"18.430124","longitude":"-69.67674","name":null},{"latitude":"17.93775","longitude":"-76.77816","name":"Norman Manley International Airport"},{"latitude":"16.762403","longitude":"-99.75459","name":"General Juan N Alvarez International Airport"},{"latitude":"20.525198","longitude":"-103.29921","name":"Don Miguel Hidalgo Y Costilla International Airport"},{"latitude":"29.089905","longitude":"-111.051704","name":"General Ignacio P. Garcia International Airport"},{"latitude":"19.435278","longitude":"-99.07278","name":"Licenciado Benito Juarez International Airport"},{"latitude":"25.77657","longitude":"-100.114395","name":"General Mariano Escobedo International Airport"},{"latitude":"20.678297","longitude":"-105.24898","name":null},{"latitude":"23.162354","longitude":"-109.717285","name":"Los Cabos International Airport"},{"latitude":"32.546284","longitude":"-116.97466","name":null},{"latitude":"21.040457","longitude":"-86.874435","name":null},{"latitude":"9.066897","longitude":"-79.38764","name":"Tocumen International Airport"},{"latitude":"22.99845","longitude":"-82.40818","name":null},{"latitude":"23.039896","longitude":"-81.43694","name":"Juan Gualberto Gomez International Airport"},{"latitude":"19.29637","longitude":"-81.35779","name":"Owen Roberts International Airport"},{"latitude":"25.048223","longitude":"-77.463776","name":"Lynden Pindling International Airport"},{"latitude":"17.539167","longitude":"-88.308334","name":"Philip S. W. Goldson International Airport"},{"latitude":"-37.004787","longitude":"174.78352","name":"Auckland International Airport"},{"latitude":"-43.488655","longitude":"172.5389","name":"Christchurch International Airport"},{"latitude":"-41.329037","longitude":"174.81216","name":"Wellington International Airport"},{"latitude":"26.26918","longitude":"50.62605","name":"Bahrain International Airport"},{"latitude":"26.471111","longitude":"49.79778","name":"King Fahd International Airport"},{"latitude":"26.39286","longitude":"50.17475","name":"King Abdulaziz Air Base"},{"latitude":"21.670233","longitude":"39.150578","name":"King Abdulaziz International Airport"},{"latitude":"24.544369","longitude":"39.698967","name":"Prince Mohammad Bin Abdulaziz Airport"},{"latitude":"24.95929","longitude":"46.702877","name":"King Khaled International Airport"},{"latitude":"35.40863","longitude":"51.1548","name":"Imam Khomeini International Airport"},{"latitude":"35.691532","longitude":"51.32187","name":"Mehrabad International Airport"},{"latitude":"36.227173","longitude":"59.64165","name":"Mashhad International Airport"},{"latitude":"29.54613","longitude":"52.58997","name":"Shiraz Shahid Dastghaib International Airport"},{"latitude":"38.12285","longitude":"46.244274","name":"Tabriz International Airport"},{"latitude":"31.722534","longitude":"35.98932","name":"Queen Alia International Airport"},{"latitude":"29.240116","longitude":"47.971252","name":"Kuwait International Airport"},{"latitude":"33.826073","longitude":"35.49308","name":"Beirut Rafic Hariri International Airport"},{"latitude":"24.426912","longitude":"54.645973","name":"Abu Dhabi International Airport"},{"latitude":"25.248665","longitude":"55.352917","name":"Dubai International Airport"},{"latitude":"24.918056","longitude":"55.175278","name":"Al Maktoum International Airport"},{"latitude":"25.320873","longitude":"55.52029","name":"Sharjah International Airport"},{"latitude":"23.588078","longitude":"58.29022","name":"Muscat International Airport"},{"latitude":"33.609707","longitude":"73.1051","name":"Benazir Bhutto International Airport"},{"latitude":"33.26846","longitude":"44.230137","name":"Baghdad International Airport"},{"latitude":"30.555555","longitude":"47.79139","name":"Basrah International Airport"},{"latitude":"36.185352","longitude":"37.227074","name":"Aleppo International Airport"},{"latitude":"33.41117","longitude":"36.51249","name":"Damascus International Airport"},{"latitude":"35.407352","longitude":"35.943993","name":"Bassel Al-Assad International Airport"},{"latitude":"25.267569","longitude":"51.558067","name":"Doha International Airport"},{"latitude":"64.818214","longitude":"-147.8668","name":"Fairbanks International Airport"},{"latitude":"61.174442","longitude":"-149.99638","name":"Ted Stevens Anchorage International Airport"},{"latitude":"13.492787","longitude":"144.80486","name":"Antonio B. Won Pat International Airport"},{"latitude":"21.325832","longitude":"-157.92166","name":"Honolulu International Airport"},{"latitude":"24.432386","longitude":"118.366615","name":"Kinmen Airport"},{"latitude":"22.5725","longitude":"120.345276","name":"Kaohsiung International Airport"},{"latitude":"25.07639","longitude":"121.22389","name":"Taiwan Taoyuan International Airport"},{"latitude":"35.773212","longitude":"140.38744","name":"Narita International Airport"},{"latitude":"34.43533","longitude":"135.24397","name":"Kansai International Airport"},{"latitude":"42.78728","longitude":"141.68134","name":"New Chitose Airport"},{"latitude":"33.584286","longitude":"130.4439","name":"Fukuoka Airport"},{"latitude":"31.801224","longitude":"130.71562","name":"Kagoshima Airport"},{"latitude":"34.858334","longitude":"136.80528","name":"Chubu Centrair International Airport"},{"latitude":"34.790974","longitude":"135.44171","name":"Osaka International Airport"},{"latitude":"35.54907","longitude":"139.78453","name":"Tokyo International Airport"},{"latitude":"35.75","longitude":"139.35","name":"Yokota Air Base"},{"latitude":"35.983334","longitude":"126.75","name":"Kunsan Air Base"},{"latitude":"33.5067","longitude":"126.49312","name":"Jeju International Airport"},{"latitude":"35.179317","longitude":"128.94873","name":"Gimhae International Airport"},{"latitude":"37.448524","longitude":"126.45123","name":"Incheon International Airport"},{"latitude":"37.083332","longitude":"127.03333","name":"Osan Air Base"},{"latitude":"37.559288","longitude":"126.80351","name":"Gimpo International Airport"},{"latitude":"36.7224","longitude":"127.49509","name":"Cheongju International Airport"},{"latitude":"26.195833","longitude":"127.645836","name":"Naha Airport"},{"latitude":"26.35","longitude":"127.76667","name":"Kadena Air Base"},{"latitude":"15.182571","longitude":"120.546486","name":"Diosdado Macapagal International Airport"},{"latitude":"14.509602","longitude":"121.01251","name":"Ninoy Aquino International Airport"},{"latitude":"7.130696","longitude":"125.6447","name":"Francisco Bangoy International Airport"},{"latitude":"10.313333","longitude":"123.98278","name":"Mactan Cebu International Airport"},{"latitude":"43.333332","longitude":"45.75","name":"Grozny North Airport"},{"latitude":"-34.81273","longitude":"-58.539833","name":"Ministro Pistarini International Airport"},{"latitude":"-1.389865","longitude":"-48.480003","name":"Val de Cans International Airport"},{"latitude":"-15.869807","longitude":"-47.921486","name":"Presidente Juscelino Kubistschek International Airport"},{"latitude":"-19.632418","longitude":"-43.963215","name":"Tancredo Neves International Airport"},{"latitude":"-27.664446","longitude":"-48.5452","name":"Hercílio Luz International Airport"},{"latitude":"-22.814653","longitude":"-43.24651","name":"Tom Jobim International Airport"},{"latitude":"-23.425669","longitude":"-46.481926","name":"São Paulo International Airport"},{"latitude":"-23.626902","longitude":"-46.659557","name":"Congonhas Airport"},{"latitude":"-12.913988","longitude":"-38.335197","name":"Deputado Luís Eduardo Magalhães International Airport"},{"latitude":"-33.397175","longitude":"-70.79382","name":null},{"latitude":"4.698602","longitude":"-74.143135","name":"El Dorado International Airport"},{"latitude":"-12.019421","longitude":"-77.107666","name":null},{"latitude":"-13.538429","longitude":"-71.94371","name":"Alejandro Velasco Astete International Airport"},{"latitude":"-34.841152","longitude":"-56.026466","name":"Carrasco International /General C L Berisso Airport"},{"latitude":"18.437403","longitude":"-66.004684","name":"Luis Munoz Marin International Airport"},{"latitude":"36.075832","longitude":"10.438611","name":"Enfidha Zine El Abidine Ben Ali International Airport"},{"latitude":"18.044722","longitude":"-63.11406","name":"Princess Juliana International Airport"},{"latitude":"43.346653","longitude":"77.01145","name":"Almaty Airport"},{"latitude":"51.02781","longitude":"71.4612","name":"Astana International Airport"},{"latitude":"43.05358","longitude":"74.46945","name":"Manas International Airport"},{"latitude":"49.67526","longitude":"73.32836","name":"Sary-Arka Airport"},{"latitude":"40.462486","longitude":"50.05039","name":"Heydar Aliyev International Airport"},{"latitude":"40.15272","longitude":"44.39805","name":"Zvartnots International Airport"},{"latitude":"41.674065","longitude":"44.958958","name":"Tbilisi International Airport"},{"latitude":"50.341244","longitude":"30.895206","name":"Boryspil International Airport"},{"latitude":"48.083332","longitude":"37.75","name":"Donetsk International Airport"},{"latitude":"45.020657","longitude":"33.99819","name":"Simferopol International Airport"},{"latitude":"49.92078","longitude":"36.281185","name":"Kharkiv International Airport"},{"latitude":"46.44101","longitude":"30.676718","name":"Odessa International Airport"},{"latitude":"59.806084","longitude":"30.3083","name":"Pulkovo Airport"},{"latitude":"53.889725","longitude":"28.032442","name":"Minsk International Airport"},{"latitude":"56.18113","longitude":"92.48286","name":"Yemelyanovo Airport"},{"latitude":"43.44884","longitude":"39.941105","name":"Sochi International Airport"},{"latitude":"56.750336","longitude":"60.804314","name":"Koltsovo Airport"},{"latitude":"41.262714","longitude":"69.26619","name":"Tashkent International Airport"},{"latitude":"55.414566","longitude":"37.899494","name":"Domodedovo International Airport"},{"latitude":"55.966324","longitude":"37.416573","name":"Sheremetyevo International Airport"},{"latitude":"54.565403","longitude":"55.884544","name":"Ufa International Airport"},{"latitude":"53.50782","longitude":"50.14742","name":"Kurumoch International Airport"},{"latitude":"19.095509","longitude":"72.87497","name":"Chhatrapati Shivaji International Airport"},{"latitude":"15.384534","longitude":"73.83983","name":"Dabolim Airport"},{"latitude":"7.174112","longitude":"79.8865","name":"Bandaranaike International Colombo Airport"},{"latitude":"11.546111","longitude":"104.84778","name":"Phnom Penh International Airport"},{"latitude":"13.408436","longitude":"103.815926","name":"Angkor International Airport"},{"latitude":"22.64531","longitude":"88.43931","name":"Netaji Subhash Chandra Bose International Airport"},{"latitude":"22.315248","longitude":"113.93649","name":"Chek Lap Kok International Airport"},{"latitude":"31.706741","longitude":"74.8073","name":"Sri Guru Ram Dass Jee International Airport, Amritsar"},{"latitude":"28.556555","longitude":"77.10079","name":"Indira Gandhi International Airport"},{"latitude":"31.116667","longitude":"77.15","name":"Shimla Airport"},{"latitude":"22.156588","longitude":"113.57285","name":"Macau International Airport"},{"latitude":"13.198889","longitude":"77.70556","name":"Bengaluru International Airport"},{"latitude":"10.155644","longitude":"76.39053","name":"Cochin International Airport"},{"latitude":"11.14025","longitude":"75.950584","name":"Calicut International Airport"},{"latitude":"17.24","longitude":"78.428055","name":"Rajiv Gandhi International Airport, Shamshabad"},{"latitude":"12.982267","longitude":"80.16378","name":"Chennai International Airport"},{"latitude":"17.24","longitude":"78.428055","name":"Rajiv Gandhi Airport"},{"latitude":"8.476126","longitude":"76.91907","name":"Trivandrum International Airport"},{"latitude":"4.201389","longitude":"73.524445","name":null},{"latitude":"13.9125","longitude":"100.60667","name":"Don Mueang International Airport"},{"latitude":"13.693062","longitude":"100.752045","name":"Suvarnabhumi Airport"},{"latitude":"18.769573","longitude":"98.96841","name":"Chiang Mai International Airport"},{"latitude":"16.055399","longitude":"108.20298","name":"Da Nang International Airport"},{"latitude":"21.214184","longitude":"105.802826","name":"Noi Bai International Airport"},{"latitude":"10.813045","longitude":"106.662476","name":"Tan Son Nhat International Airport"},{"latitude":"21.940052","longitude":"96.0875","name":"Mandalay International Airport"},{"latitude":"16.900068","longitude":"96.134155","name":"Yangon International Airport"},{"latitude":"-5.058312","longitude":"119.54589","name":"Hasanuddin International Airport"},{"latitude":"-8.748056","longitude":"115.1675","name":"Ngurah Rai (Bali) International Airport"},{"latitude":"-7.38387","longitude":"112.77724","name":"Juanda International Airport"},{"latitude":"4.945197","longitude":"114.93375","name":"Brunei International Airport"},{"latitude":"-6.130643","longitude":"106.655525","name":"Soekarno-Hatta International Airport"},{"latitude":"2.755672","longitude":"101.70539","name":"Kuala Lumpur International Airport"},{"latitude":"1.361173","longitude":"103.990204","name":"Singapore Changi International Airport"},{"latitude":"-27.40303","longitude":"153.10905","name":"Brisbane International Airport"},{"latitude":"-37.669613","longitude":"144.84978","name":"Melbourne International Airport"},{"latitude":"-31.933603","longitude":"115.960236","name":"Perth International Airport"},{"latitude":"-35.30735","longitude":"149.19052","name":"Canberra International Airport"},{"latitude":"-33.932922","longitude":"151.1799","name":"Sydney Kingsford Smith International Airport"},{"latitude":"40.078537","longitude":"116.5871","name":"Beijing Capital International Airport"},{"latitude":"39.7825","longitude":"116.38778","name":"Beijing Nanyuan Airport"},{"latitude":"39.122627","longitude":"117.3399","name":"Tianjin Binhai International Airport"},{"latitude":"37.754997","longitude":"112.62585","name":"Taiyuan Wusu Airport"},{"latitude":"23.387861","longitude":"113.29734","name":"Guangzhou Baiyun International Airport"},{"latitude":"28.193336","longitude":"113.21459","name":"Changsha Huanghua Airport"},{"latitude":"25.133333","longitude":"110.316666","name":"Guilin Liangjiang International Airport"},{"latitude":"22.61321","longitude":"108.1675","name":"Nanning Wuxu Airport"},{"latitude":"22.639444","longitude":"113.81084","name":"Shenzhen Bao\'an International Airport"},{"latitude":"34.52752","longitude":"113.84024","name":"Xinzheng Airport"},{"latitude":"30.776598","longitude":"114.209625","name":"Wuhan Tianhe International Airport"},{"latitude":"19.941612","longitude":"110.45717","name":"Haikou Meilan International Airport"},{"latitude":"18.31063","longitude":"109.409706","name":"Sanya Phoenix International Airport"},{"latitude":"34.441154","longitude":"108.75605","name":"Xi\'an Xianyang International Airport"},{"latitude":"25.101944","longitude":"102.92917","name":"Kunming Wujiaba International Airport"},{"latitude":"24.536882","longitude":"118.1275","name":"Xiamen Gaoqi International Airport"},{"latitude":"25.93123","longitude":"119.66923","name":"Fuzhou Changle International Airport"},{"latitude":"30.236935","longitude":"120.43236","name":"Hangzhou Xiaoshan International Airport"},{"latitude":"36.85769","longitude":"117.20688","name":"Yaoqiang Airport"},{"latitude":"29.820415","longitude":"121.462395","name":"Ningbo Lishe International Airport"},{"latitude":"31.735737","longitude":"118.86652","name":"Nanjing Lukou Airport"},{"latitude":"31.151825","longitude":"121.799805","name":"Shanghai Pudong International Airport"},{"latitude":"31.196815","longitude":"121.34197","name":"Shanghai Hongqiao International Airport"},{"latitude":"27.91566","longitude":"120.84738","name":"Wenzhou Yongqiang Airport"},{"latitude":"29.72034","longitude":"106.63408","name":"Chongqing Jiangbei International Airport"},{"latitude":"26.544216","longitude":"106.79598","name":"Longdongbao Airport"},{"latitude":"30.581135","longitude":"103.9568","name":"Chengdu Shuangliu International Airport"},{"latitude":"43.90126","longitude":"87.47515","name":null},{"latitude":"45.620853","longitude":"126.23644","name":"Taiping Airport"},{"latitude":"38.96102","longitude":"121.53999","name":"Zhoushuizi Airport"},{"latitude":"41.861084","longitude":"123.426926","name":"Taoxian Airport"}]');
}
