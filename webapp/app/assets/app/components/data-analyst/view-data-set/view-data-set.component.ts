import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {DataSetService} from '../../../services/data-set.service';
import {DataSet} from '../../../models/data-set';
import {SearchQueryService} from '../../../services/search-query.service';
import {SearchQuery} from '../../../models/search-query';

export enum Tab { HIVE, HBASE, HDFS}

@Component({
    selector: 'view-data-set',
    templateUrl: 'assets/app/components/data-analyst/view-data-set/view-data-set.component.html',
    styleUrls: ['assets/app/components/data-analyst/view-data-set/view-data-set.component.css']
})

export class ViewDataSetComponent implements OnInit {
    tab = Tab;
    dataSetName: string;
    activeTab: Tab = Tab.HIVE;
    dataSet: DataSet = new DataSet();
    hiveTables: any[] = [];
    host: string;
    dataCenter: string;

    constructor(private activatedRoute: ActivatedRoute, private dataSetService: DataSetService,
                private searchQueryService: SearchQueryService,  private router: Router) {}

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.dataSetName = params['id'];
            this.host = this.getParameterByName('host');
            this.dataCenter = this.getParameterByName('dataCenter');

            this.dataSetService.getByName(this.dataSetName, this.host, this.dataCenter).subscribe((result:DataSet)=> {
                let searchQuery = new SearchQuery();

                searchQuery.clusterHost = this.host;
                searchQuery.dataCenter = this.dataCenter;
                searchQuery.predicates = result.hiveFilters;

                this.searchQueryService.getHiveData(searchQuery).subscribe(tableResults => {
                    this.hiveTables = tableResults;
                });
            });
        });

    }

    getParameterByName(name: string) {
        let url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    showData(id: string) {
        let navigationExtras = {
            'queryParams' : {'host': this.host, 'id': id}
        };
        this.router.navigate(['ui/view-data/' + this.dataCenter], navigationExtras);
    }

    setActiveTab($event: any, activeTab: Tab) {
        this.activeTab = activeTab;
        $event.preventDefault();
    }
}