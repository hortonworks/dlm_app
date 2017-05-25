import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { routes } from './app.routes';

import { AppComponent } from './app.component';
import { SignedInForSecureGuard , NotSignedInForUnsecureGuard, DoCleanUpAndRedirectGuard } from './shared/utils/auth-guard';
import { LandingPageGuard } from './shared/utils/landing-page-guard';

import { NotFoundRouteComponent } from './views/not-found-route/not-found-route.component';
import { SignInComponent } from './views/sign-in/sign-in.component';
import { SidebarComponent } from './widgets/sidebar/sidebar.component';
import { AuthenticationService } from './services/authentication.service';
import { LakeService } from './services/lake.service';
import { LocationService } from './services/location.service';
import { ClusterService } from './services/cluster.service';
import { IdentityService } from './services/identity.service';
import { ConfigurationService } from './services/configuration.service';
import { MdlService } from './services/mdl.service';
import { HeaderComponent } from './widgets/header/header.component';
import { MdlDirective } from './directives/mdl.directive';

import {CategoryService} from "./services/category.service";
import {DataSetService} from "./services/dataset.service";
import {DatasetTagService} from "./services/tag.service";
import { DropdownComponent } from './shared/dropdown/dropdown.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [
    AppComponent,

    NotFoundRouteComponent,
    SignInComponent,
    SidebarComponent,
    HeaderComponent,

    MdlDirective
  ],
  bootstrap: [AppComponent],
  providers: [
    AuthenticationService,
    DatasetTagService,
    CategoryService,
    DataSetService,
    LakeService,
    LocationService,
    ClusterService,
    IdentityService,
    ConfigurationService,

    MdlService,

    SignedInForSecureGuard,
    NotSignedInForUnsecureGuard,
    DoCleanUpAndRedirectGuard,
    LandingPageGuard
  ]
})
export class AppModule { }
