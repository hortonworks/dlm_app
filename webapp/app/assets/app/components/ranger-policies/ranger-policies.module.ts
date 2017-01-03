import {NgModule} from '@angular/core';

import {RangerPoliciesComponent}   from './ranger-policies.component';
import {RangerPoliciesService} from '../../services/ranger.service';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [SharedModule],
    exports: [RangerPoliciesComponent],
    declarations: [RangerPoliciesComponent],
    providers: [RangerPoliciesService],
})
export class RangerPoliciesModule {
}
