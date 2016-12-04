import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import { HttpModule } from '@angular/http';
import {FormsModule}   from '@angular/forms';
import {routes} from './app.routes';
import AppComponent from './app';
import DashboardComponent from './components/dashboard/dashboard';
import LoginComponent  from './components/login';
import LogoutComponent  from './components/logout';
import {AuthService} from './services/authservice';
import AddClusterComponent from './components/add-cluster/add-cluster.component';
import {SidenavRouterLinkDirective} from './sidenav-router-link.directive';
import {ClusterService} from './services/cluster.service';
import {DataCenterService} from './services/data-center.service';
import {ViewClusterModule} from './components/view-cluster/view-cluster.module';
import {LoggedInGuard, AlreadyLoggedInGuard} from './common/utils/login-gaurd';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot(routes),
        ViewClusterModule
    ],
    declarations: [SidenavRouterLinkDirective, AppComponent, DashboardComponent, LoginComponent,LogoutComponent,
                    AddClusterComponent],
    bootstrap: [AppComponent],
    providers: [AuthService, ClusterService, DataCenterService,LoggedInGuard,AlreadyLoggedInGuard]
})

export class AppModule {
}

