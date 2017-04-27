import { Component, OnInit, Input, Output, forwardRef, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Cluster } from '../../../../models/cluster.model';
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
export class CreatePairingCardListComponent implements OnInit, ControlValueAccessor {

  @Input() clusters: Cluster[];
  @Input() selectedClusterId: string;
  @Output() change = new EventEmitter<Cluster>();
  onChange = (_: any) => {};

  constructor() { }

  ngOnInit() { }

  writeValue(clusterId: string) {
    this.selectedClusterId = clusterId;
  }

  registerOnChange(onChange) {
    this.onChange = onChange;
  }

  registerOnTouched() { }

  selectCluster(cluster: Cluster) {
    this.selectedClusterId = cluster.id;
    this.onChange(this.selectedClusterId);
    this.change.emit(cluster);
  }
}