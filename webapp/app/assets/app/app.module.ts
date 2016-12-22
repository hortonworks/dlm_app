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
import {SidenavRouterLinkDirective} from './sidenav-router-link.directive';
import {AmbariService} from './services/ambari.service';
import {DataCenterService} from './services/data-center.service';
import {BackupPolicyService} from './services/backup-policy.service';
import {ViewClusterModule} from './components/view-cluster/view-cluster.module';
import {AddClusterModule} from './components/add-cluster/add-cluster.module';
import {ViewDataModule} from './components/view-data/view-data.module';
import {LoggedInGuard, AlreadyLoggedInGuard} from './common/utils/login-gaurd';
import {AddBdrModule} from './components/add-bdr/add-bdr.module';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot(routes),
        ViewClusterModule,
        AddClusterModule,
        AddBdrModule,
        ViewDataModule
    ],
    declarations: [SidenavRouterLinkDirective, AppComponent, DashboardComponent, LoginComponent, LogoutComponent],
    bootstrap: [AppComponent],
    providers: [AuthService, AmbariService, DataCenterService, BackupPolicyService, LoggedInGuard,AlreadyLoggedInGuard]
})

export class AppModule {
}

