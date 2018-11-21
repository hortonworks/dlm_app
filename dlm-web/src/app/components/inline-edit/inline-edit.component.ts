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

import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {
  InlineEditWidgetType,
  InlineEditRadioOptions,
  InlineEditCheckboxOptions
} from 'components/inline-edit/inline-edit.type';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'dlm-inline-edit',
  templateUrl: './inline-edit.component.html',
  styleUrls: ['./inline-edit.component.scss']
})
export class InlineEditComponent implements OnInit {
  @Input() type: InlineEditWidgetType;
  @Input() value: any;
  @Input() qeAttr = 'inline-edit';
  @Input()
  get showWidget(): boolean {
    return this._showWidget;
  }

  set showWidget(show: boolean) {
    this._showWidget = show;
    if (!show) {
      this.form.patchValue({
        widgetValue: this.value
      });
    }
  }

  @Input() options: InlineEditRadioOptions|InlineEditCheckboxOptions|any = {};

  @Output() confirmValue = new EventEmitter();
  @Output() cancelValue = new EventEmitter();

  private _showWidget = false;

  get textAreaQeAttr(): string {
    return this.qeAttr + '-textarea-body';
  }

  get radioQeAttr(): string {
    return this.qeAttr + '-radio';
  }

  get okButtonQeAttr(): string {
    return this.qeAttr + '-ok-button';
  }

  get cancelButtonQeAttr(): string {
    return this.qeAttr + '-cancel-button';
  }

  widgetTypes = InlineEditWidgetType;

  form: FormGroup = this.formBuilder.group({
    widgetValue: ''
  });

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form.patchValue({
      widgetValue: this.value
    });
  }

  cancel() {
    this.showWidget = false;
    this.cancelValue.emit(this.form.get('widgetValue').value);
  }

}
