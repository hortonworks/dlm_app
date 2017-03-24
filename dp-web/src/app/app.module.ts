import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { routes } from './routes/routes.config';

import { SidenavRouterLinkDirective } from './sidenav-router-link.directive';
import { AppComponent } from './app.component';
import { Environment } from './environment';
import { AuthenticationService } from './services/authentication.service';
import { AmbariService } from './services/ambari.service';
import { BackupPolicyService } from './services/backup-policy.service';
import { DataCenterService } from './services/data-center.service';
import { LoggedInGuard , AlreadyLoggedInGuard} from './shared/utils/login-guard';
import { GeographyService } from './services/geography.service';
import { BreadcrumbService } from './services/breadcrumb.service';
import { DashboardModule } from './components/dashboard/dashboard.module';
import { ViewClusterModule } from './components/view-cluster/view-cluster.module';
import { AddClusterModule } from './components/add-cluster/add-cluster.module';
import { AddBdrModule } from './components/add-bdr/add-bdr.module';
import { ViewDataModule } from './components/view-data/view-data.module';
import { AnalystDashboardModule } from './components/data-analyst/analyst-dashboard/analyst-dashboard.module';
import { DataSetModule } from './components/data-analyst/data-set/data-set.module';
import { AddDataSetModule } from './components/data-analyst/add-data-set/add-data-set.module';
import { ViewDataSetModule } from './components/data-analyst/view-data-set/view-data-set.module';
import { DataManagerModule } from './components/data-manager/data-manager.module';
import { LogoutComponent } from './logout/logout.component';

import { NotFoundRouteComponent } from './routes/not-found-route/not-found-route.component';
import { SignInComponent } from './routes/sign-in/sign-in.component';
import { FirstRunComponent } from './routes/first-run/first-run.component';
import { LakeAddComponent } from './routes/lake-add/lake-add.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

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
    ViewDataSetModule,
    DataManagerModule
  ],
  declarations: [
    SidenavRouterLinkDirective,
    AppComponent,

    LogoutComponent,
    NotFoundRouteComponent,
    SignInComponent,
    FirstRunComponent,
    LakeAddComponent,
    SidebarComponent,
  ],
  bootstrap: [AppComponent],
  providers: [
    Environment,
    AuthenticationService,
    AmbariService,
    BackupPolicyService,
    DataCenterService,
    LoggedInGuard,
    AlreadyLoggedInGuard,
    GeographyService,
    BreadcrumbService
  ]
})
export class AppModule { }
