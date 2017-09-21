/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {
  Component, ElementRef, EventEmitter, Input, Output, SimpleChange, ViewChild, OnInit, OnChanges,
  HostListener
} from '@angular/core';
import {Subject} from 'rxjs/Subject';

export class TaggingWidgetTagModel {
  constructor(public display: string, public data?: any) {
  }
}

@Component({
  selector: 'tagging-widget',
  styleUrls: ['./tagging-widget.component.scss'],
  templateUrl: './tagging-widget.component.html',
})
export class TaggingWidget implements OnInit, OnChanges {
  @Input() tags: Array<string | TaggingWidgetTagModel> = [];
  @Input() availableTags: Array<string | TaggingWidgetTagModel> = [];
  @Input() allowTagDismissal: boolean = true;
  @Input() clearOnSearch: boolean = false;
  @Input() searchText: string = '';
  @Input() placeHolderText: string = '';
  @Input() restrictFreeText = false;
  @Input() minChars = 0;
  @Input() searchable = true;

  @Output('textChange') searchTextEmitter = new EventEmitter<string>();
  @Output('onNewSearch') newTagEmitter = new EventEmitter<string | TaggingWidgetTagModel>();
  @Output('onTagDelete') deleteTagEmitter = new EventEmitter<string | TaggingWidgetTagModel>();

  @ViewChild('parent') parent: ElementRef;
  @ViewChild('input') input: ElementRef;

  isValid = true;

  focusRowIndex: number = -1;
  private focusStickerIndex: number = -1; // this.tags.length;
  fetchInProgress = false;
  private selectOnSingleMatch = false;

  private dataChanged = new Subject<boolean>();
  private dataChanged$ = this.dataChanged.asObservable();

  showOptions = false;
  noMatchError = false;

  @HostListener('document:click', ['$event', '$event.target'])
  public onDocumentClick($event: MouseEvent, targetElement: HTMLElement): void {
    if (targetElement === this.input.nativeElement || this.parent.nativeElement.contains(targetElement)) {
      return;
    }
    this.showOptions = false;
    if (this.searchText && this.searchText.trim() && !this.restrictFreeText) {
      this.tags.push(this.searchText.trim());
      this.searchText = '';
    }
  }

  ngOnInit() {
    this.dataChanged$.subscribe(() => {
      if (this.availableTags.length === 1 && this.selectOnSingleMatch) {
        this.addOnSingleMatch();
      }
    });
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (changes['availableTags']) {
      this.fetchInProgress = false;
      this.showOptions = this.availableTags && this.availableTags.length > 0 && this.searchText && this.searchText.length > 0;
      this.noMatchError = this.restrictFreeText && this.searchText && this.searchText.length >0 && (!this.availableTags || this.availableTags.length === 0);
      this.focusRowIndex = -1;
      this.dataChanged.next();
    }
  }

  onSearchTextChange(newValue) {
    this.availableTags = [];
    this.fetchInProgress = true;
    this.searchText = newValue;
    if (newValue.length >= this.minChars) {
      this.searchTextEmitter.emit(this.searchText);
    } else {
      this.showOptions = false;
      this.noMatchError = false;
    }
    this.isValid = !(newValue && newValue.length && this.restrictFreeText);
  }

  emitSearchText() {
    this.newTagEmitter.emit(this.searchText.trim());
  }

  onKeyUp(event) {
    this.selectOnSingleMatch = false;
    if ([13, 38, 40].indexOf(event.keyCode) === -1 && this.focusStickerIndex === this.tags.length && event.target.selectionStart) {
      return;
    }
    switch (event.keyCode) {
      case 8  :
      case 46 :
        this.allowTagDismissal && this.focusStickerIndex < this.tags.length && this.removeFocusTag();
      /* falls through */
      case 37 :
        this.allowTagDismissal && (this.focusStickerIndex = Math.max(0, this.focusStickerIndex - 1));
        break;
      case 39 :
        this.allowTagDismissal && (this.focusStickerIndex = Math.min(this.tags.length, this.focusStickerIndex + 1));
        break;

      case 38 :
        this.focusRowIndex = Math.max(-1, this.focusRowIndex - 1);
        this.highlightRow();
        event.stopPropagation();
        break;
      case 40  :
        this.focusRowIndex = Math.min(this.availableTags.length - 1, this.focusRowIndex + 1);
        this.highlightRow();
        event.stopPropagation();
        break;
      case 13  :
        if (this.searchable && this.fetchInProgress) {
          this.selectOnSingleMatch = true;
          return;
        }
        this._manageSelection();
      case 9:
        return;
    }
    setTimeout(() => this._manageFocus(), 0);
  }

  private highlightRow() {
    if (this.focusRowIndex > -1) {
      let options = document.getElementsByClassName('row');
      let highlightedOption: any = options[this.focusRowIndex];
      highlightedOption.focus();
    }
  }

  _manageSelection() {
    if (this.availableTags && this.availableTags.length === 1) {
      this.addOnSingleMatch();
      return;
    }
    this.showOptions = false;
    if (this.focusRowIndex > -1) {
      this.newTagEmitter.emit(this.availableTags[this.focusRowIndex]);
      this.clearOnSearch && this.onSearchTextChange('');
      this.focusStickerIndex++;
    } else if (this.searchText && this.searchText.trim() && this.focusStickerIndex === this.tags.length && !this.restrictFreeText) {
      this.newTagEmitter.emit(this.searchText.trim());
      this.clearOnSearch && this.onSearchTextChange('');
      this.focusStickerIndex++;
    }
    this.parent.nativeElement.querySelector('span.inputSpan input').focus();
  }

  private addOnSingleMatch() {
    this.newTagEmitter.emit(this.availableTags[0]);
    this.searchText = '';
    this.clearOnSearch && this.onSearchTextChange('');
    this.focusStickerIndex++;
    this.showOptions = false;
    this.parent.nativeElement.querySelector('span.inputSpan input').focus();
  }

  onClick() {
    this.parent.nativeElement.querySelector('span.inputSpan input').focus();
  }

  _manageFocus() {
    if (this.focusStickerIndex < this.tags.length) {
      this.parent.nativeElement.querySelector('span.tagSticker').focus();
      this.focusRowIndex = -1;
    }
    if (this.focusStickerIndex === this.tags.length) {
      this.parent.nativeElement.querySelector('span.inputSpan input').focus();
    }
  }

  removeFocusTag() {
    if (!this.searchText || this.searchText.length === 0) {
      this.deleteTagEmitter.emit(this.tags.splice(this.focusStickerIndex, 1)[0]);
    }
  }

  onInputFocus() {
    this.focusStickerIndex = this.tags.length;
    if (!this.showOptions) {
      this.onSearchTextChange(this.searchText);
    }
  }

  onInputBlur() {
    if (this.searchText && this.searchText.trim() && !this.restrictFreeText && !this.showOptions) {
      this.tags.push(this.searchText.trim());
      this.searchText = '';
    }
  }

  focusOnSticker(i) {
    this.focusStickerIndex = i;
  }
}
