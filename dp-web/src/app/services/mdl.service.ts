import { Injectable, ElementRef } from '@angular/core';

declare var componentHandler: any;

@Injectable()
export class MdlService {

  upgrade() {
    if (componentHandler) {
      componentHandler.upgradeAllRegistered();
    }
  }

  closeDrawer(layout: ElementRef) {
    const mdlLayout = layout.nativeElement.MaterialLayout;
    const drawerIsOpen = layout.nativeElement.querySelector('.mdl-layout__drawer.is-visible') !== null;
    if(mdlLayout && drawerIsOpen) {
      mdlLayout.toggleDrawer();
    }
  }

}
