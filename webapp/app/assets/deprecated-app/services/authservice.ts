import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {LoginData} from '../models/userdata';

/**
 * Use common/utils/HttpClient for making authenticated calls
 */
@Injectable()
export class AuthService {
    private loggedIn = false;

    constructor(private http: Http) {
        this.loggedIn = !!localStorage.getItem('dp_auth_token');
    }

    login(userName: string, password: string):Promise<LoginData> {
        localStorage.setItem('user', userName);
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(
            'auth/login',
            JSON.stringify({'username': userName, 'password': password}),
            {headers}
        )
            .toPromise()
            .then(res => {
                    this.loggedIn = true;
                    localStorage.setItem('dp_auth_token', res.json().auth_token);
                    localStorage.setItem('dp_userType', res.json().userType);
                    return new LoginData(userName,password, res.json().userType);
                }
            )
            .catch(error=> {
                this.loggedIn = false;
                return this.handleError(error);
            });

    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }


    logout() {
        localStorage.removeItem('dp_auth_token');
        localStorage.removeItem('dp_userType');
        this.loggedIn = false;

    }

    isLoggedIn() {
        let state = !!localStorage.getItem('dp_auth_token');
        return state;
    }
}
