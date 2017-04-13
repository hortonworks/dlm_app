import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { routes } from './app.routes';

import { AppComponent } from './app.component';
import { SignedInForSecureGuard , NotSignedInForUnsecureGuard, DoCleanUpAndRedirectGuard } from './shared/utils/auth-guard';

import { NotFoundRouteComponent } from './views/not-found-route/not-found-route.component';
import { SignInComponent } from './views/sign-in/sign-in.component';
import { SidebarComponent } from './widgets/sidebar/sidebar.component';
import { AuthenticationService } from './services/authentication.service';
import { LakeService } from './services/lake.service';
import { LocationService } from './services/location.service';
import { ClusterService } from './services/cluster.service';
import { IdentityService } from './services/identity.service';
import { MdlService } from './services/mdl.service';
import { HeaderComponent } from './widgets/header/header.component';
import { MdlDirective } from './directives/mdl.directive';

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

    MdlDirective,
  ],
  bootstrap: [AppComponent],
  providers: [
    AuthenticationService,
    LakeService,
    LocationService,
    ClusterService,
    IdentityService,

    MdlService,

    SignedInForSecureGuard,
    NotSignedInForUnsecureGuard,
    DoCleanUpAndRedirectGuard,

  ]
})
export class AppModule { }
