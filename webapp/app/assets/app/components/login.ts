import {Component} from "@angular/core"
import {LoginData} from "./models/userdata"
import { AuthService } from "../services/authservice"
import "rxjs/add/operator/toPromise"
import { Router } from "@angular/router"


@Component({
    selector: "dp-login" ,
    templateUrl: "assets/app/components/login.html"
})

export default class LoginComponent {

    constructor(private userService: AuthService, private router: Router) {}

    model: LoginData = new LoginData("","")

    submitted: boolean = false

    onSubmit() {
        this.submitted = true
        this.userService.login(this.model.name, this.model.password)
            .then(res=>
                this.router.navigate(["ui/dashboard"])
            ).catch(error =>
            this.router.navigate(["ui/login"])
        )

    }

}
