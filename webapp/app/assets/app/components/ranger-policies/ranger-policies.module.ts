import {NgModule} from '@angular/core';

import {RangerPoliciesComponent}   from './ranger-policies.component';
import {RangerService} from '../../services/ranger.service';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [SharedModule],
    exports: [RangerPoliciesComponent],
    declarations: [RangerPoliciesComponent],
    providers: [RangerService],
})
export class RangerPoliciesModule {
}
