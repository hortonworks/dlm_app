/**
 * Created by rksv on 04/12/16.
 */
import {Component, OnInit, Input, AfterViewInit} from '@angular/core';
import {HiveDataService} from '../../services/hive-data.service';
import {Schema} from '../../models/schema';

declare var Datamap:any;

export enum Tab { PROPERTIES, TAGS, AUDITS, SCHEMA}

@Component({
    selector: 'hive-data',
    styleUrls: ['assets/app/components/hive-data/hive-data.component.css'],
    templateUrl: 'assets/app/components/hive-data/hive-data.component.html'
})
export class HiveDataComponent implements OnInit, AfterViewInit {
    map: any;
    tab = Tab;
    schemaData: Schema[] = [];
    activeTab: Tab = Tab.PROPERTIES;

    @Input() search: string = '';

    constructor(private hiveDataService: HiveDataService) {}

    ngOnInit() {
        this.hiveDataService.getSchemaData().subscribe((schemaData: Schema[]) => {
            this.schemaData = schemaData;
        });
    }

    ngAfterViewInit() {
        this.map = new Datamap({element: document.getElementById('mapcontainer'),projection: 'mercator',
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