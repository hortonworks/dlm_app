import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { routes } from './routes/routes.config';

import { AppComponent } from './app.component';
import { Environment } from './environment';
import { LoggedInGuard , AlreadyLoggedInGuard} from './shared/utils/login-guard';

import { NotFoundRouteComponent } from './routes/not-found-route/not-found-route.component';
import { SignInComponent } from './routes/sign-in/sign-in.component';
import { SidebarComponent } from './widgets/sidebar/sidebar.component';

import { AuthenticationService } from './services/authentication.service';
import { LakeService } from './services/lake.service';
import { LocationService } from './services/location.service';
import { ClusterService } from './services/cluster.service';
import { IdentityService } from './services/identity.service';
import { HeaderComponent } from './widgets/header/header.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    RouterModule.forRoot(routes),
  ],
  declarations: [
    AppComponent,

    NotFoundRouteComponent,
    SignInComponent,
    SidebarComponent,
    HeaderComponent,
  ],
  bootstrap: [AppComponent],
  providers: [
    Environment,
    AuthenticationService,
    LakeService,
    LocationService,
    ClusterService,
    IdentityService,

    LoggedInGuard,
    AlreadyLoggedInGuard,
  ]
})
export class AppModule { }
