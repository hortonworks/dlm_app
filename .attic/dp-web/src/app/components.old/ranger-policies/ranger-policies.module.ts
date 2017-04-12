import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RangerPoliciesComponent }   from './ranger-policies.component';
import { RangerService } from '../../services/ranger.service';
import { LoaderSpinModule } from '../../shared/loader-spin/loader-spin.module';

@NgModule({
    imports: [CommonModule, FormsModule, LoaderSpinModule],
    exports: [RangerPoliciesComponent],
    declarations: [RangerPoliciesComponent],
    providers: [RangerService],
})
export class RangerPoliciesModule {
}
