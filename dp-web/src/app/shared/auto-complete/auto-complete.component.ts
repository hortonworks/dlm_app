import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";

@Component({
  selector: 'auto-complete',
  template: `
    <div class="autoComplete" #topCont>
        <input #input (ngModelChange)="onTextChange($event)" (focus)="onInputFocus()" (blur)="onInputBlur()"/>
        <div class="dropDown" [style.left.px]="input.offsetLeft">
        <div *ngFor="let opt of options;let i=index;"
               class="row"  >{{opt.displayName || opt}}</div>
        </div>
    </div> 
  `
})
class MultiSelect1 {
  @Input('suggestions') options : any[];
  @Output('textUpdate') changeEmitter: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('topCont') topCont:ElementRef;
  onInputFocus(){this.topCont.nativeElement.classList.add('focus')}
  onInputBlur() {this.topCont.nativeElement.classList.remove('focus')}

}
