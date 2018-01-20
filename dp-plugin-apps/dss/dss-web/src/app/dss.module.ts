import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {Http, HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {TranslateStore} from '@ngx-translate/core/src/translate.store';

import { AppComponent } from './dss.component';
import {routes} from './dss.routes';
import {CollapsibleNavModule} from './shared/collapsible-nav/collapsible-nav.modue';
import {HeaderModule} from './shared/header/header.module';
import {AuthenticationService} from './services/authentication.service';

export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http);
}

export function startupServiceFactory(authenticationService: AuthenticationService) {
  return () => authenticationService.loadUser();
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes),
    CollapsibleNavModule,
    HeaderModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  providers: [
      TranslateStore,
      TranslateService,
      AuthenticationService,
      {
        provide: APP_INITIALIZER,
        useFactory: startupServiceFactory,
        deps: [AuthenticationService],
        multi: true
      }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
