import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {routes} from './onboard.routes';
import {NguiAutoCompleteModule} from '@ngui/auto-complete';
import {FirstRunComponent} from './views/first-run/first-run.component';
import {DpOnboardComponent} from './views/dp-onboard/dp-onboard.component';
import {LakesComponent} from './views/lakes/lakes.component';
import {SecurityComponent} from './views/security/security.component';
import {DataSetComponent} from './views/datasets/datasets.component';
import {MultiSelect} from '../../shared/multi-select/multi-select.component';
import {LdapConfigComponent} from './views/dp-onboard/ldap-config/ldap-config.component';
import {UserAddComponent} from './views/dp-onboard/user-add/user-add.component';
import {TranslateModule} from '@ngx-translate/core';
import {TaggingWidgetModule} from '../../shared/tagging-widget/tagging-widget.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    NguiAutoCompleteModule,
    RouterModule.forChild(routes),
    TaggingWidgetModule,
    TranslateModule
  ],
  declarations: [
    FirstRunComponent,
    SecurityComponent,
    LakesComponent,
    MultiSelect,
    DataSetComponent,
    DpOnboardComponent,
    LdapConfigComponent,
    UserAddComponent
  ]
})
export class OnboardModule {
}
