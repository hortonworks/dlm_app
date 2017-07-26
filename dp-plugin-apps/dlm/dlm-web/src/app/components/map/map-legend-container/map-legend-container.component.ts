import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dlm-map-legend-container',
  template: `
    <ng-content></ng-content>
  `,
  styleUrls: ['./map-legend-container.component.scss']
})
export class MapLegendContainerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
