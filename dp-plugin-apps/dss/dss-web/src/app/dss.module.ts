import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {Http, HttpModule, RequestOptions} from '@angular/http';
import {RouterModule} from '@angular/router';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {TranslateStore} from '@ngx-translate/core/src/translate.store';

import { AppComponent } from './dss.component';
import {routes} from './dss.routes';
import {CollapsibleNavModule} from './shared/collapsible-nav/collapsible-nav.modue';
import {HeaderModule} from './shared/header/header.module';
import {AuthenticationService} from './services/authentication.service';
import {CommentsModule} from './shared/comments/comments.module';
import {BaseDssRequestOptions} from './dss-request-options';
import {MdlService} from './services/mdl.service';
import {MdlDirective} from './shared/directives/mdl.directive';

export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http);
}

export function startupServiceFactory(authenticationService: AuthenticationService) {
  return () => authenticationService.loadUser();
}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes),
    CollapsibleNavModule,
    HeaderModule,
    CommentsModule,
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
    MdlDirective
  ],
  providers: [
      MdlService,
      TranslateStore,
      TranslateService,
      AuthenticationService,
      {
        provide: APP_INITIALIZER,
        useFactory: startupServiceFactory,
        deps: [AuthenticationService],
        multi: true
      },
      { provide: RequestOptions,
        useClass: BaseDssRequestOptions
      }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
