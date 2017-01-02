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
import {GeographyService} from './services/geography.service';
import {DataCenterService} from './services/data-center.service';
import {BackupPolicyService} from './services/backup-policy.service';
import {ViewClusterModule} from './components/view-cluster/view-cluster.module';
import {AddClusterModule} from './components/add-cluster/add-cluster.module';
import {ViewDataModule} from './components/view-data/view-data.module';
import {LoggedInGuard, AlreadyLoggedInGuard} from './common/utils/login-gaurd';
import {AddBdrModule} from './components/add-bdr/add-bdr.module';
import {AnalystDashboardModule} from './components/data-analyst/analyst-dashboard/analyst-dashboard.module';
import {Environment} from './environment';
import {DataSetModule} from './components/data-analyst/data-set/data-set.module';
import {AddDataSetModule} from './components/data-analyst/add-data-set/add-data-set.module';
import {ViewDataSetModule} from './components/data-analyst/view-data-set/view-data-set.module';
import {DashboardModule} from './components/dashboard/dashboard.module';
import {BreadcrumbService} from './services/breadcrumb.service';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot(routes),
        DashboardModule,
        ViewClusterModule,
        AddClusterModule,
        AddBdrModule,
        ViewDataModule,
        AnalystDashboardModule,
        DataSetModule,
        AddDataSetModule,
        ViewDataSetModule
    ],
    declarations: [SidenavRouterLinkDirective, AppComponent, LoginComponent, LogoutComponent],
    bootstrap: [AppComponent],
    providers: [Environment, AuthService, AmbariService, BackupPolicyService, DataCenterService, LoggedInGuard, AlreadyLoggedInGuard, GeographyService, BreadcrumbService]
})

export class AppModule {}

