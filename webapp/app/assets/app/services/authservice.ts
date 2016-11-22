import { Injectable } from "@angular/core"
import { Headers, Http } from "@angular/http"
import "rxjs/add/operator/toPromise"

@Injectable()
export class AuthService {
    private loggedIn = false

    constructor(private http: Http) {
        this.loggedIn = !!localStorage.getItem("auth_token")
    }


    login(userName: string, password: string) {
        let headers = new Headers()
        headers.append("Content-Type", "application/json")
        console.log(userName)
        return this.http.post(
                "auth/login",
                JSON.stringify({"userName":userName, "password":password}),
                { headers }
            )
            .toPromise()
            .then(res => res.json().data)
            .catch(error=> console.log(error))

    }

    logout() {
        localStorage.removeItem("auth_token")
        this.loggedIn = false
    }

    isLoggedIn() {
        return this.loggedIn
    }
}