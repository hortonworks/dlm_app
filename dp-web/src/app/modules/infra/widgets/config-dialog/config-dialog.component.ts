/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ClusterDetailRequest} from '../../../../models/cluster-state';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'dp-config-dialog',
  templateUrl: './config-dialog.component.html',
  styleUrls: ['./config-dialog.component.scss']
})
export class ConfigDialogComponent implements OnChanges {

  @Input() requestAmbariCreds;
  @Input() requestKnoxURL;
  @Input() show;
  @Output('onSave') saveEmitter: EventEmitter<ClusterDetailRequest> = new EventEmitter<ClusterDetailRequest>();
  @Output('onCancel') closeEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('configForm') configForm: NgForm;

  errorMessage: string;
  showError: boolean;

  clusterDetailsRequest: ClusterDetailRequest = new ClusterDetailRequest();

  constructor(private translateService: TranslateService) {

  }

  ngOnChanges(changes: SimpleChanges) {
    let dialog: any = document.querySelector('#dialog');
    if (changes['show'] && this.show) {
      if (dialog) {
        this.clusterDetailsRequest = new ClusterDetailRequest();
        dialog.showModal();
      }
    }
  }

  save() {
    if (!this.configForm.form.valid) {
      this.errorMessage = this.translateService.instant('common.defaultRequiredFields');
      this.showError = true;
      return;
    }
    let dialog: any = document.querySelector('#dialog');
    dialog.close();
    this.saveEmitter.emit(this.clusterDetailsRequest);
  }

  cancel() {
    let dialog: any = document.querySelector('#dialog');
    dialog.close();
    this.closeEmitter.emit(true);
  }

}
