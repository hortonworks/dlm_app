/*
* Usage :
* <multi-select [list]="myList" (update)="onMultiSelectChange($event)"></multi-select>
*
*
*class consumerComponent{
*   myList: any[] = [{"name":"display name"}, ...];
*   onMultiSelectChange(selection : any[]) {
*     // do something with selection
*   }
* }
*
* */
import {Component, Input, Output, EventEmitter} from "@angular/core";

@Component({
  selector: 'multi-select',
  template: `
    <div *ngFor="let optn of options; let i = index">
      <input #checkboxInput type="checkbox" [checked]="optn.checked" (click)="updateChecked(i, checkboxInput.checked)"/>
      <label (click)="updateChecked(i, checkboxInput.checked = !checkboxInput.checked);">{{optn.name}}</label>
    </div>
  `
})
export class MultiSelect {
  @Input('list')
  options : any[];

  @Output('update')
  changeEmitter: EventEmitter<any[]> = new EventEmitter<any[]>();

  updateChecked (i, state) {
    this.options[i].checked = state;
    this.changeEmitter.emit(this.options)
  }
}
