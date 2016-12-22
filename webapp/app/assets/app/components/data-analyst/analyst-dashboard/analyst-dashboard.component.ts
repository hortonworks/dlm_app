import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'analyst-dashboard',
    templateUrl: 'assets/app/components/data-analyst/analyst-dashboard/analyst-dashboard.component.html',
    styleUrls: ['assets/app/components/data-analyst/analyst-dashboard/analyst-dashboard.component.css']
})
export class AnalystDashboardComponent implements OnInit {
    ngOnInit() {
        console.log('here ...');
    }
}