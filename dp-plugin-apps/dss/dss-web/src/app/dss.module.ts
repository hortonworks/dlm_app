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
import {DssAppEvents} from './services/dss-app-events';
import {LakeService} from './services/lake.service';
import {navigation} from './_nav';
import {DataLakeDashboardModule} from './components/data-lake-dashboard/data-lake-dashboard.module';
import {DatasetModule} from './components/dataset/dataset.module';

export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http);
}

export function startupServiceFactory(authenticationService: AuthenticationService, lakeService: LakeService) {
  return () => authenticationService.loadUser()
              .then(() => lakeService.listAsPromise())
              .then((lakes) => {
                let dashboard = navigation.find(n => (n.name === 'Dashboard'));
                lakes = lakes.sort((a, b) => a.name.localeCompare(b.name));
                dashboard.children = lakes.map(lake => ({name: `${lake.name}, ${lake.dcName}`, url: `/dss/data-lake-dashboard/${lake.id}`, iconClassName: ''}));
              });
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
    DatasetModule,
    DataLakeDashboardModule,
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
      DssAppEvents,
      AuthenticationService,
      LakeService,
      {
        provide: APP_INITIALIZER,
        useFactory: startupServiceFactory,
        deps: [AuthenticationService, LakeService],
        multi: true
      },
      { provide: RequestOptions,
        useClass: BaseDssRequestOptions
      }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
