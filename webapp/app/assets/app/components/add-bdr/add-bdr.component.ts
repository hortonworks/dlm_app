import {Component, OnInit, AfterViewInit} from '@angular/core';

declare var Datamap:any;

@Component({
    selector: 'add-bdr',
    templateUrl: 'assets/app/components/add-bdr/add-bdr.component.html',
    styleUrls: ['assets/app/components/add-bdr/add-bdr.component.scss']
})
export class AddBdrComponent implements OnInit, AfterViewInit {
    map: any;
    entity = 'Table';
    welcomeText = `Configure Backup and Disaster Recovery for the selected Entity. You can select the target cluster to copy the data and the schedule for backup and recovery`;

    ngOnInit() {
        console.log('here ....');
    }

    ngAfterViewInit() {
        this.map = new Datamap({element: document.getElementById('map'),projection: 'mercator',
            height: 295,
            width: 385,
            fills: {
                defaultFill: '#ABE3F3',
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
}
