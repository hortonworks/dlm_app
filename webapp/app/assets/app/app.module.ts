import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import { HttpModule } from '@angular/http';
import {FormsModule}   from '@angular/forms';
import {routes} from './app.routes';
import AppComponent from './app';
import DashboardComponent from './components/dashboard/dashboard';
import LoginComponent  from './components/login';
import {AuthService} from './services/authservice';
import {SidenavRouterLinkDirective} from './sidenav-router-link.directive';
import {ClusterService} from './services/cluster.service';
import {DataCenterService} from './services/data-center.service';
import {ViewClusterModule} from './components/view-cluster/view-cluster.module';
import {AddClusterModule} from './components/add-cluster/add-cluster.module';
import {ViewDataModule} from './components/view-data/view-data.module';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot(routes),
        ViewClusterModule,
        AddClusterModule,
        ViewDataModule
    ],
    declarations: [SidenavRouterLinkDirective, AppComponent, DashboardComponent, LoginComponent],
    bootstrap: [AppComponent],
    providers: [AuthService, ClusterService, DataCenterService]
})

export class AppModule {
}

