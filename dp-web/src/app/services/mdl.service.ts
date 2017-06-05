import { Injectable, ElementRef } from '@angular/core';

declare var componentHandler: any;

@Injectable()
export class MdlService {

  upgrade() {
    if (componentHandler) {
      componentHandler.upgradeAllRegistered();
    }
  }
}
