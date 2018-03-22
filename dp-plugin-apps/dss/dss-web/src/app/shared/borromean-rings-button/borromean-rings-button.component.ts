import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-borromean-rings-button',
  templateUrl: './borromean-rings-button.component.html',
  styleUrls: ['./borromean-rings-button.component.scss']
})
export class BorromeanRingsButtonComponent {
  @Output('onClick') onClick = new EventEmitter<void>();

  clicked() {
    this.onClick.emit();
  }
}
