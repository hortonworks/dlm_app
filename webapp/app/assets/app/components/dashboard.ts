import {Component,AfterViewInit} from "@angular/core"

declare var Datamap:any

@Component({
    selector: "dash-board",
    templateUrl: "assets/app/components/dashboard.html"
})

export default class DashboardComponent implements AfterViewInit {
    ngAfterViewInit() {
        let map = new Datamap({element: document.getElementById("mapcontainer"),projection: "mercator"})
    }
}
