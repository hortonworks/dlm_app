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

import {Component, ElementRef, EventEmitter, Input, Output, SimpleChange, ViewChild, AfterViewInit} from '@angular/core';

export class TaggingWidgetTagModel {
  constructor(public display: string, public data?: any) {
  }
}

@Component({
  selector: 'tagging-widget',
  styleUrls: ['./tagging-widget.component.scss'],
  templateUrl: './tagging-widget.component.html',
})
export class TaggingWidget implements AfterViewInit {
  @Input() tags: Array<string | TaggingWidgetTagModel> = [];
  @Input() availableTags: Array<string | TaggingWidgetTagModel> = [];
  @Input() allowTagDismissal: boolean = true;
  @Input() clearOnSearch: boolean = false;
  @Input() searchText: string = '';
  @Input() placeHolderText: string = '';
  @Input() theme: TagTheme = TagTheme.LIGHT;
  @Input() restrictFreeText = false;

  @Output('textChange') searchTextEmitter = new EventEmitter<string>();
  @Output('onNewSearch') newTagEmitter = new EventEmitter<string | TaggingWidgetTagModel>();
  @Output('onTagDelete') deleteTagEmitter = new EventEmitter<string | TaggingWidgetTagModel>();

  @ViewChild('parent') parent: ElementRef;

  isValid = true;
  blurTimeout: any = null;

  focusRowIndex: number = -1;
  private focusStickerIndex: number = -1; // this.tags.length;

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (changes['availableTags']) {
      this.focusRowIndex = -1;
    }
  }

  onSearchTextChange(newValue) {
    this.searchText = newValue;
    this.searchTextEmitter.emit(this.searchText);
    this.isValid = !(newValue && newValue.length && this.restrictFreeText);
  }

  emitSearchText() {
    this.newTagEmitter.emit(this.searchText.trim());
  }

  ngAfterViewInit() {
    if (this.theme as TagTheme === TagTheme.DARK as TagTheme) {
      let classes = this.parent.nativeElement.className;
      this.parent.nativeElement.className = `${classes} taggingWidget-dark`;
    }
  }

  onKeyDown(event) {
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
        event.stopPropagation();
        setTimeout(() => this._SetCursorAtEnd(), 0);
        break;
      case 40  :
        this.focusRowIndex = Math.min(this.availableTags.length - 1, this.focusRowIndex + 1);
        event.stopPropagation();
        break;
      case 13  :
        this._manageSelection();
      case 9:
        return;
    }
    setTimeout(() => this._manageFocus(), 0);
  }

  _SetCursorAtEnd() {
    const input = this.parent.nativeElement.querySelector('span.inputSpan input');
    input.value = input.value; //Triggering model change
  }

  _manageSelection() {
    if (this.focusRowIndex > -1) {
      this.newTagEmitter.emit(this.availableTags[this.focusRowIndex]);
      this.clearOnSearch && this.onSearchTextChange('');
      this.focusStickerIndex++;
    } else if (this.searchText && this.searchText.trim() && this.focusStickerIndex === this.tags.length && !this.restrictFreeText) {
      this.newTagEmitter.emit(this.searchText.trim());
      this.clearOnSearch && this.onSearchTextChange('');
      this.focusStickerIndex++;
    }
  }

  onClick() {
    this.blurTimeout && clearTimeout(this.blurTimeout);
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
    this.deleteTagEmitter.emit(this.tags.splice(this.focusStickerIndex, 1)[0]);
    setTimeout(() => this._SetCursorAtEnd(), 0);
  }

  onInputFocus() {
    this.focusStickerIndex = this.tags.length;
    this.parent.nativeElement.classList.add('focus');
  }

  onInputBlur() {
    this.blurTimeout = setTimeout(() => this.parent.nativeElement.classList.remove('focus'), 300);
  }

  focusOnSticker(i) {
    this.focusStickerIndex = i;
  }
}

export enum TagTheme {
  DARK,
  LIGHT
}
