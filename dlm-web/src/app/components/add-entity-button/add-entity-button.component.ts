/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DropdownItem } from 'components/dropdown/dropdown-item';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dlm-add-entity-button',
  styleUrls: ['./add-entity-button.component.scss'],
  template: `
    <dlm-dropdown
      qe-attr="add-entity"
      [items]="addOptions"
      [disabled]="disabled"
      [text]="'common.add' | translate"
      [buttonClass]="buttonClass"
      (onSelectItem)="handleSelectedAdd($event)"
      [alignRight]="true"
      >
    </dlm-dropdown>
  `
})
export class AddEntityButtonComponent implements OnInit, OnChanges {
  @Input() buttonClass = 'btn-secondary';
  @Input() disabled = false;
  @Input() canAddPolicy = true;
  @Input() canAddPairing = true;
  addOptions: DropdownItem[];

  constructor(private t: TranslateService, private router: Router) {
    this.addOptions = [
      { label: this.t.instant('common.policy'), qeAttr: 'policy', routeTo: ['/policies/create'], disabled: !this.canAddPolicy },
      { label: this.t.instant('common.pairing'), qeAttr: 'pairing', routeTo: ['/pairings/create'], disabled: !this.canAddPairing },
    ];
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.addOptions[0].disabled = !this.canAddPolicy;
    this.addOptions[1].disabled = !this.canAddPairing;
  }

  handleSelectedAdd(item) {
    this.router.navigate(item.routeTo);
  }

}
