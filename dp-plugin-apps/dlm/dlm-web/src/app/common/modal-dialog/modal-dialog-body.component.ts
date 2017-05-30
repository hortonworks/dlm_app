import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'dlm-modal-dialog-body',
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-content></ng-content>
  `
})
export class ModalDialogBodyComponent { }
