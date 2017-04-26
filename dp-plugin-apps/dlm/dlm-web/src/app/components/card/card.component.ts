import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dp-card',
  template: `
    <div class="dlm-card">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
