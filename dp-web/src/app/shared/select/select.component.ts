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