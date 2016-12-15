import {Component, Input, AfterViewInit, OnChanges, SimpleChanges} from '@angular/core';
import {HiveDataService} from '../../services/hive-data.service';
import {Schema} from '../../models/schema';

declare var Datamap:any;

export enum Tab { PROPERTIES, TAGS, AUDITS, SCHEMA}

@Component({
    selector: 'hive-data',
    styleUrls: ['assets/app/components/hive-data/hive-data.component.css'],
    templateUrl: 'assets/app/components/hive-data/hive-data.component.html'
})
export class HiveDataComponent implements AfterViewInit, OnChanges {
    map: any;
    tab = Tab;
    showView: boolean= false;
    schemaData: Schema[] = [];
    activeTab: Tab = Tab.PROPERTIES;

    @Input() search: string = '';

    constructor(private hiveDataService: HiveDataService) {}

    init(search: string) {
        this.showView = search.length > 0;
        this.hiveDataService.getSchemaData().subscribe((schemaData: Schema[]) => {
            this.schemaData = schemaData;
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['search'] && changes['search'].currentValue) {
            this.init(changes['search'].currentValue);
        }
    }

    ngAfterViewInit() {
        this.map = new Datamap({element: document.getElementById('mapcontainer'),
            height: 273,
            width: 385,
            projection: 'mercator',
            fills: {
                defaultFill: '#676966'
            },
            bubblesConfig: {
                popupTemplate: function(geography: any, data: any) {
                    return '<div class="hoverinfo">' + JSON.stringify(data) +'</div>';
                },
                borderWidth: '2',
                borderColor: '#FFFFFF',
            }
        });
    }

    setActiveTab($event: any, activeTab: Tab) {
        this.activeTab = activeTab;
        $event.preventDefault();
    }
}