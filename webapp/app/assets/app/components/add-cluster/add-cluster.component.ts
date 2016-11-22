/**
 * Created by rksv on 22/11/16.
 */
import {Component, AfterViewInit} from "@angular/core"

declare var Datamap:any

@Component({
    selector: "add-cluster" ,
    styleUrls: ["assets/app/components/add-cluster/add-cluster.component.css"],
    templateUrl: "assets/app/components/add-cluster/add-cluster.component.html"
})

export default class AddClusterComponent  implements AfterViewInit {
    ngAfterViewInit() {
        let map = new Datamap({element: document.getElementById("map"),projection: "mercator"})
    }
}
