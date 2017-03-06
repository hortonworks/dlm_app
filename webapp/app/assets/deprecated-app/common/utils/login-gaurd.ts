import { Injectable } from '@angular/core';
import { AuthService } from '../../services/authservice';
import { CanActivate, Router} from '@angular/router';

@Injectable()
export class LoggedInGuard implements CanActivate {
    constructor(private auth: AuthService,private router: Router) {}

    canActivate() {

         if(this.auth.isLoggedIn()) {
             return true;
         }

        // not logged in so redirect to login page
        this.router.navigate(['ui/login']);
        return false;

    }
}

@Injectable()
export class AlreadyLoggedInGuard implements CanActivate {
    constructor(private auth: AuthService,private router: Router) {}

    canActivate() {
        if(this.auth.isLoggedIn()) {
            this.router.navigate(['ui/dashboard']);
            return true;
        }
        return true;
    }
}