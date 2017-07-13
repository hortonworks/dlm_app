import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, Http} from '@angular/http';
import {RouterModule} from '@angular/router';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';


import {routes} from './app.routes';

import {AppComponent} from './app.component';
import {SignedInForSecureGuard, NotSignedInForUnsecureGuard, DoCleanUpAndRedirectGuard} from './shared/utils/auth-guard';
import {LandingPageGuard} from './shared/utils/landing-page-guard';

import {NotFoundRouteComponent} from './views/not-found-route/not-found-route.component';
import {SignInComponent} from './views/sign-in/sign-in.component';
import {AuthenticationService} from './services/authentication.service';
import {LakeService} from './services/lake.service';
import {LocationService} from './services/location.service';
import {ClusterService} from './services/cluster.service';
import {IdentityService} from './services/identity.service';
import {ConfigurationService} from './services/configuration.service';
import {MdlService} from './services/mdl.service';
import {MdlDirective} from './directives/mdl.directive';

import {CategoryService} from './services/category.service';
import {DataSetService} from './services/dataset.service';
import {DatasetTagService} from './services/tag.service';
import {HeaderModule} from './widgets/header/header.module';
import {CollapsibleNavModule} from './shared/collapsible-nav/collapsible-nav.modue';
import {SidebarComponent} from './widgets/sidebar/sidebar.component';
import {UserService} from './services/user.service';
import {CollapsibleNavService} from './services/collapsible-nav.service';
import {AssetService} from './services/asset.service';
import {LoaderSpinModule} from './shared/loader-spin/loader-spin.module';
import {Loader} from './shared/utils/loader';
import {RbacService} from './services/rbac.service';
import {AuthErrorComponent} from './shared/auth-error/auth-error.component';
import {NavigationGuard} from './shared/utils/navigation-guard';

import {JwtHelper} from 'angular2-jwt';

export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HeaderModule,
    CollapsibleNavModule,
    RouterModule.forRoot(routes),
    LoaderSpinModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  declarations: [
    AppComponent,

    NotFoundRouteComponent,
    SignInComponent,
    SidebarComponent,
    AuthErrorComponent,

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
    AssetService,
    UserService,
    CollapsibleNavService,
    Loader,
    RbacService,

    MdlService,

    SignedInForSecureGuard,
    NotSignedInForUnsecureGuard,
    DoCleanUpAndRedirectGuard,
    LandingPageGuard,
    NavigationGuard,

    JwtHelper
  ]
})
export class AppModule {
}
