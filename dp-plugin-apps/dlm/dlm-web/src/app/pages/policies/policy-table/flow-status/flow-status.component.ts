/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { POLICY_MODES } from 'constants/policy.constant';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dlm-flow-status',
  template: `
    <div class="flow-status">
      <div class="flow-status-chart">
        <div class="flow-current-state active">
          {{'page.policies.flow_status.source_abbrev' | translate}}
        </div>
        <div class="flow-line"><span class="caret"></span></div>
        <div ngClass="flow-desired-state">
          {{modeAbbrev}}
        </div>
      </div>
      <div class="flow-status-text">
        <div class="flow-current-state">{{'common.source' | translate}}</div>
        <div class="flow-desired-state">{{modeTranslate}}</div>
      </div>
    </div>
  `,
  styleUrls: ['./flow-status.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FlowStatusComponent {
  private translateNS = 'page.policies.flow_status';
  POLICY_MODES = POLICY_MODES;
  @Input() mode: POLICY_MODES = POLICY_MODES.READ_WRITE;

  get modeTranslate(): string {
    return this.t.instant({
      [POLICY_MODES.READ_ONLY]: `${this.translateNS}.read_only`,
      [POLICY_MODES.READ_WRITE]: `${this.translateNS}.read_write`,
    }[this.mode] || ' ');
  }

  get modeAbbrev(): string {
    return this.t.instant({
      [POLICY_MODES.READ_ONLY]: `${this.translateNS}.read_only_abbrev`,
      [POLICY_MODES.READ_WRITE]: `${this.translateNS}.read_write_abbrev`,
    }[this.mode] || ' ');
  }

  constructor(private t: TranslateService) { }
}
