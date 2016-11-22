import {Component} from "@angular/core"
import {LoginData} from "./models/loginform"
import { AuthService } from "../services/authservice"
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
        this.router.navigate(["ui/dashboard"])
    }

}
