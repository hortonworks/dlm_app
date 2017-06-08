import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DropdownItem } from 'components/dropdown/dropdown-item';
import { TranslateService } from '@ngx-translate/core';
import { Cluster } from 'models/cluster.model';
import { PairsCountEntity } from 'models/pairs-count-entity.model';
import { mapToList } from 'utils/store-util';

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

  static addingPairingsAvailable(clusters: Cluster[], pairsCount: PairsCountEntity) {
    return clusters.length > 1 && !mapToList(pairsCount).every(pair => pair.pairsCount === clusters.length - 1);
  }

  static addingPoliciesAvailable(pairsCount: PairsCountEntity) {
    return Object.keys(pairsCount).length > 0;
  }

  static availableActions([clusters, pairsCount]: [Cluster[], PairsCountEntity]): {canAddPolicy: boolean, canAddPairing: boolean} {
    return {
      canAddPairing: AddEntityButtonComponent.addingPairingsAvailable(clusters, pairsCount),
      canAddPolicy: AddEntityButtonComponent.addingPoliciesAvailable(pairsCount)
    };
  }

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
