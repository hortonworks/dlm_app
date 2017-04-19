import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'cluster-card',
  templateUrl: './cluster-card.component.html',
  styleUrls: ['./cluster-card.component.scss']
})
export class ClusterCardComponent implements OnInit {

  @Input() isSelected = false;

  constructor() { }

  ngOnInit() {
  }

}
