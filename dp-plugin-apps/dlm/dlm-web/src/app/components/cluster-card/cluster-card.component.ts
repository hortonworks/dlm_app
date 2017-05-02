import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dlm-cluster-card',
  templateUrl: './cluster-card.component.html',
  styleUrls: ['./cluster-card.component.scss']
})
export class ClusterCardComponent implements OnInit {

  @Input() isSelected = false;
  @Input() isDisabled = false;
  constructor() { }

  ngOnInit() {
  }

}
