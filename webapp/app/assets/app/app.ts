import {Component,AfterViewInit} from "@angular/core"
import { Router } from "@angular/router"
import { AuthService } from "./services/authservice"

declare var Datamap:any
declare var componentHandler:any

@Component({
    selector: "data-plane",
    templateUrl: "assets/app/app.html"
})

export default class AppComponent implements AfterViewInit  {

    constructor(public router: Router,private authService: AuthService) {

    }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn()
    }


    ngAfterViewInit() {
        componentHandler.upgradeAllRegistered()
    }
}
