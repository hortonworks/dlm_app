import { Component, ViewChild, ElementRef, Input, HostListener, OnInit, Output, EventEmitter } from '@angular/core';
import {Persona} from '../../../models/header-data';

@Component({
  selector: 'dp-persona-popup',
  templateUrl: './persona-popup.component.html',
  styleUrls: ['./persona-popup.component.scss']
})
export class PersonaPopupComponent implements OnInit {
  
  showPopup = false;
  
  @Input() personas:Persona[] = [];
  @Input() personaNavSrc: ElementRef;
  @Output() personaChange = new EventEmitter<Persona>();

  @ViewChild('personaNav') personaNav: ElementRef;
  
  constructor() { }

  ngOnInit() {
  }

  navigateToPersona(persona: Persona) {
    this.showPopup = false;
    this.personaChange.emit(persona);
  }

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement): void {
    if (!targetElement) {
      return;
    }

    if (targetElement === this.personaNavSrc.nativeElement) {
      this.showPopup = !this.showPopup;
      return;
    }

    const clickedInside = this.personaNav.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.showPopup = false;
    }
  }

}
