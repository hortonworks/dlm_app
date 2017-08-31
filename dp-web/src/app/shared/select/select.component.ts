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

import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'dp-select',
  styleUrls: ['./select.component.scss'],
  template: `
        <span class="select-wrap" (click)="onClick">
            <ng-content></ng-content>
        </span>
    `
})
export class SelectComponent {

  @HostListener('click', ['$event', '$event.target'])
  public onClick($event:MouseEvent, targetElement:HTMLElement):void {
    let firstOption = targetElement.querySelectorAll('option')[0];
    if (firstOption && firstOption.text == 'Select') {
      firstOption.disabled = true;
    }
  }
}
