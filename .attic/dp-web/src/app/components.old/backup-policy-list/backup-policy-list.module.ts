import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BackupPolicyListComponent} from './backup-policy-list.component';
import {BackupPolicyService} from '../../services/backup-policy.service';

@NgModule ({
  imports: [CommonModule],
  exports: [BackupPolicyListComponent],
  declarations: [BackupPolicyListComponent],
  providers: [BackupPolicyService],
})

export class BackupPolicyListModule {
}
