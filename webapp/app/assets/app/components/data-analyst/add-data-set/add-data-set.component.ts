import {Component, OnInit, AfterViewInit} from '@angular/core';
import {AmbariService} from '../../../services/ambari.service';
import {DataCenterService} from '../../../services/data-center.service';
import {Ambari} from '../../../models/ambari';
import {DataCenter} from '../../../models/data-center';
import {CityNames} from '../../../common/utils/city-names';
import {Environment} from '../../../environment';
import {SearchQueryService} from '../../../services/search-query.service';
import {DataSet} from '../../../models/data-set';
import {SearchQuery} from '../../../models/search-query';
import {SearchParamWrapper} from '../../../shared/data-plane-search/search-param-wrapper';
import {Alerts} from '../../../shared/utils/alerts';
import {DataSetService} from '../../../services/data-set.service';
import {DataFilter} from '../../../models/data-filter';

declare var Datamap:any;

export enum Tab {
    HIVE,
    HBASE,
    HDFS
}

@Component({
    selector: 'add-data-set',
    templateUrl: 'assets/app/components/data-analyst/add-data-set/add-data-set.component.html',
    styleUrls: ['assets/app/components/data-analyst/add-data-set/add-data-set.component.css']
})
export class AddDataSetComponent implements OnInit, AfterViewInit {
    map: any;
    tab = Tab;
    activeTab: Tab = Tab.HIVE;
    ambaris: Ambari[]= [];
    dataCenters: DataCenter[] = [];
    dataSet: DataSet = new DataSet();
    ambarisInDatacenter: Ambari[] = [];
    hiveSearchParamWrappers: SearchParamWrapper[] = [];
    hbaseSearchParamWrappers: SearchParamWrapper[] = [];
    hiveTables: any[] = [];
    hiveFilters: DataFilter[] = [];

    constructor(private dataCenterService: DataCenterService, private ambariService: AmbariService,  private environment: Environment,
                private searchQueryService: SearchQueryService, private dataSetService: DataSetService) {
        this.hiveSearchParamWrappers = environment.hiveSearchParamWrappers;
        this.hbaseSearchParamWrappers = environment.hbaseSearchParamWrappers;
    }

    ngOnInit() {
        this.dataCenterService.get().subscribe((dataCenters: DataCenter[]) => {
            this.dataCenters = dataCenters;
        });
        this.ambariService.get().subscribe((ambaris: Ambari[]) => {
            this.ambaris = ambaris;
        });
    }

    ngAfterViewInit() {
        this.map = new Datamap({element: document.getElementById('map'),projection: 'mercator',
            fills: {
                defaultFill: '#E5E5E5'
            },
            bubblesConfig: {
                popupTemplate: function(geography: any, data: any) {
                    return '<div class="hoverinfo">' + data.location +'</div>';
                },
                borderWidth: '2',
                borderColor: '#FFFFFF',
            }
        });
    }

    getAmbariHostName(ambari: Ambari) {
        return  ambari.host;
    }

    onDataCenterChange(dataCenterName: string) {
        let dataCenterByName = this.getDataCenterByName(dataCenterName);
        if (dataCenterByName !== null) {
            this.onCityChange(dataCenterByName);
        }

        this.ambarisInDatacenter = [];
        for (let ambari of this.ambaris) {
            if (ambari.dataCenter === dataCenterName) {
                this.ambarisInDatacenter.push(ambari);
            }
        }
    }

    getDataCenterByName(dataCenterName: string): DataCenter {
        for (let dataCenter of this.dataCenters) {
            if (dataCenter.name.toLocaleLowerCase() === dataCenterName.toLocaleLowerCase()) {
                return dataCenter;
            }
        }

        return null;
    }

    onCityChange(dataCenter: DataCenter) {
        let coordinates = CityNames.getCityCoordinates(dataCenter.location.country, dataCenter.location.place);
        let cityBubble = [{
            name: 'name',
            radius:5,
            yield: 400,
            borderColor: '#4C4C4C',
            location: dataCenter.location.place + ' - ' + dataCenter.location.country,
            latitude: parseFloat(coordinates[0]),
            longitude: parseFloat(coordinates[1])
        }];
        this.map.bubbles(cityBubble);
    }

    fetchHiveData($event) {
        console.log($event);
        this.hiveFilters = $event;
        let searchQuery = new SearchQuery();
        searchQuery.dataCenter = this.dataSet.dataCenter;
        searchQuery.clusterHost = this.dataSet.ambariHost;
        searchQuery.predicates = $event;
        this.searchQueryService.getHiveData(searchQuery).subscribe(result => {
            this.hiveTables = result;
        });
    }

    getColumnNames(table: any[]) {
        return table['columns'].map(column => column.name);
    }

    onSave() {
        this.dataSet.hiveFilters = this.hiveFilters;
        this.dataSet.hBaseFilters = this.hiveFilters;
        this.dataSet.fileFilters = this.hiveFilters;
        this.dataSet.permissions =  'Random Permissions';
        this.dataSet.description =  'Random Permissions';
        this.dataSetService.post(this.dataSet).subscribe(result => {
            Alerts.showSuccessMessage('Created data set '+ this.dataSet.name);
            window.history.back();
        });

    }

    back() {
        window.history.back();
    }
}