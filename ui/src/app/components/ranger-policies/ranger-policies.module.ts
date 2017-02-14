import {NgModule} from '@angular/core';

import {RangerPoliciesComponent}   from './ranger-policies.component';
import {RangerService} from '../../services/ranger.service';
import {SharedModule} from '../../shared/shared.module';
import {LoaderSpinModule} from '../../shared/loader-spin/loader-spin.module';

@NgModule({
    imports: [SharedModule, LoaderSpinModule],
    exports: [RangerPoliciesComponent],
    declarations: [RangerPoliciesComponent],
    providers: [RangerService],
})
export class RangerPoliciesModule {
}
