import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'loader-spin',
    styleUrls: ['./loader-spin.component.scss'],
    template: `
        <div class="gb-loader-spin">
          <svg class="gb-loader-spin__circular" viewBox="25 25 50 50">
            <circle class="gb-loader-spin__path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
          </svg>
        </div>
    `
})
export class LoaderSpinComponent {

}
