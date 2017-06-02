import { Component, OnInit, OnChanges,  SimpleChange, Input, Output, forwardRef, ViewEncapsulation, EventEmitter } from '@angular/core';
import { ClusterPairing } from 'models/cluster-pairing.model';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export const CUSTOM_RADIO_BUTTON_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CreatePairingCardListComponent),
  multi: true
};

@Component({
  selector: 'dlm-create-pairing-card-list',
  templateUrl: './create-pairing-card-list.component.html',
  styleUrls: ['./create-pairing-card-list.component.scss'],
  providers: [CUSTOM_RADIO_BUTTON_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})
export class CreatePairingCardListComponent implements OnInit, OnChanges, ControlValueAccessor {

  @Input() clusters: ClusterPairing[];
  @Input() selectedCluster: ClusterPairing;
  @Input() isFrozen = false;
  @Output() change = new EventEmitter<ClusterPairing>();
  disabledClusters: ClusterPairing[];
  selectedClusterId: number;
  showDivider = false;

  onChange = (_: any) => {};

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['clusters']) {
      this.disabledClusters = this.clusters.filter(cluster => cluster.disabled === true);
      this.clusters = this.clusters.filter(cluster => cluster.disabled !== true);
      this.showDivider = (this.clusters.length > 0) && (this.disabledClusters.length > 0);
    }
    if (changes['selectedCluster']) {
      if (this.selectedCluster) {
        this.selectedClusterId = this.selectedCluster.id;
      } else {
        this.selectedClusterId = null;
      }
    }
  }

  writeValue(clusterId: number) {
    this.selectedClusterId = clusterId;
  }

  registerOnChange(onChange) {
    this.onChange = onChange;
  }

  registerOnTouched() { }

  selectCluster(cluster: ClusterPairing) {
    if (!cluster.disabled && !this.isFrozen) {
      this.selectedClusterId = cluster.id;
      this.onChange(this.selectedClusterId);
      this.change.emit(cluster);
    }
  }
}
