/**
 * Created by rksv on 03/12/16.
 */
import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'drop-down',
    styleUrls: ['./dropdown.component.scss'],
    template: `
        <span class="select-wrap">
            <ng-content></ng-content>
        </span>
    `
})
export class DropDownComponent {

}