import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dlm-map-legend',
  template: `
    <ng-content></ng-content>
  `,
  styleUrls: ['./map-legend.component.scss']
})
export class MapLegendComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
