import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DropdownItem } from 'components/dropdown/dropdown-item';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dlm-add-entity-button',
  styleUrls: ['./add-entity-button.component.scss'],
  template: `
    <dlm-dropdown
      [items]="addOptions"
      [text]="'common.add' | translate"
      [buttonClass]="buttonClass"
      (onSelectItem)="handleSelectedAdd($event)"
      [alignRight]="true"
      >
    </dlm-dropdown>
  `
})
export class AddEntityButtonComponent implements OnInit, OnChanges {
  @Input() buttonClass = 'btn-secondary';
  @Input() canAddPolicy = true;
  @Input() canAddPairing = true;
  addOptions: DropdownItem[];

  constructor(private t: TranslateService, private router: Router) {
    this.addOptions = [
      // TODO: clusters link should be changed with absolute reference to dataplane application
      { label: t.instant('common.cluster'), routeTo: ['/clusters'] },
      { label: t.instant('common.policy'), routeTo: ['/policies/create'], disabled: !this.canAddPolicy },
      { label: t.instant('common.pairing'), routeTo: ['/pairings/create'], disabled: !this.canAddPairing },
    ];
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.addOptions[1].disabled = !this.canAddPolicy;
    this.addOptions[2].disabled = !this.canAddPairing;
  }

  handleSelectedAdd(item) {
    this.router.navigate(item.routeTo);
  }

}
