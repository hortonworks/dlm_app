import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'analyst-dashboard',
    templateUrl: './analyst-dashboard.component.html',
    styleUrls: ['./analyst-dashboard.component.scss']
})
export class AnalystDashboardComponent implements OnInit {
    ngOnInit() {
        console.log('here ...');
    }
}