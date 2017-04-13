import { Directive, AfterViewChecked } from '@angular/core';
import { MdlService } from '../services/mdl.service';

@Directive({
    selector: '[mdl]'
})
export class MdlDirective implements AfterViewChecked {

  constructor(
    private mdlService: MdlService
  ) {}

  ngAfterViewChecked() {
    this.mdlService.upgrade();
  }
}
