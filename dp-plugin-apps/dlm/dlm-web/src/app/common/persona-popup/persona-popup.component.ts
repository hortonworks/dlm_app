/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, ViewChild, ElementRef, Input, HostListener, OnInit, Output, EventEmitter } from '@angular/core';
import { Persona } from 'models/header-data';

@Component({
  selector: 'dp-persona-popup',
  templateUrl: './persona-popup.component.html',
  styleUrls: ['./persona-popup.component.scss']
})
export class PersonaPopupComponent implements OnInit {
  showPopup = false;

  @Input() personas: Persona[] = [];
  @Input() personaNavSrc;
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
    if (targetElement === this.personaNavSrc || (this.personaNavSrc && this.personaNavSrc.contains(targetElement))) {
      this.showPopup = !this.showPopup;
      return;
    }

    const clickedInside = !!this.personaNav && this.personaNav.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.showPopup = false;
    }
  }

}
