import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {TranslateModule} from '@ngx-translate/core';
import {NguiAutoCompleteModule} from '@ngui/auto-complete';
import {routes} from './infra.routes';
import {LakesComponent} from './views/lakes/lakes.component';
import {ClusterAddComponent} from './views/cluster-add/cluster-add.component';
import {LakeStatsComponent} from './widgets/lake-stats/lake-stats.component';
import {LakesListComponent} from './widgets/lakes-list/lakes-list.component';
import {MapComponent} from './widgets/map/map.component';
import {TaggingWidgetModule} from '../../shared/tagging-widget/tagging-widget.module';
import {CollapsibleNavModule} from '../../shared/collapsible-nav/collapsible-nav.modue';
import {SharedModule} from '../../shared/shared.module';
import {DpSorterModule} from '../../shared/dp-table/dp-sorter/dp-sorter.module';
import {ClusterDetailsComponent} from './views/cluster-details/cluster-details.component';
import {UserManagementComponent} from './views/user-management/user-management.component';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {AddUserComponent} from './views/user-management/add-user/add-user.component';
import {PaginationModule} from '../../shared/pagination/pagination.module';
import {UsersComponent} from './views/user-management/users/users.component';
import {GroupsComponent} from './views/user-management/groups/groups.component';
import {AddGroupComponent} from './views/user-management/add-group/add-group.component';
import {ConfigDialogComponent} from './widgets/config-dialog/config-dialog.component';
import {ServiceManagementComponent} from './views/service-management/service-management.component';
import {VerificationComponent} from './views/service-management/verification/verification.component';
import {TabsModule} from '../../shared/tabs/tabs.module';
import { ManualInstallCheckComponent } from './views/service-management/manual-install-check/manual-install-check.component';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    DpSorterModule,
    NguiAutoCompleteModule,
    TaggingWidgetModule,
    CollapsibleNavModule,
    DropdownModule,
    TranslateModule,
    PaginationModule,
    TabsModule
  ],

  declarations: [
    LakesComponent,
    ClusterAddComponent,
    LakeStatsComponent,
    LakesListComponent,
    ClusterDetailsComponent,
    MapComponent,
    UserManagementComponent,
    AddUserComponent,
    UsersComponent,
    GroupsComponent,
    AddGroupComponent,
    ConfigDialogComponent,
    ServiceManagementComponent,
    VerificationComponent,
    ManualInstallCheckComponent
  ]
})
export class InfraModule {
}
