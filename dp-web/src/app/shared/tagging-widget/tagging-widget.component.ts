import {Component, ElementRef, EventEmitter, Input, Output, SimpleChange, ViewChild} from "@angular/core";

export class TaggingWidgetTagModel {
  constructor(public display: string, public data?: any) {
  }
}

@Component({
  selector: "tagging-widget",
  styleUrls: ["./tagging-widget.component.scss"],
  templateUrl: "./tagging-widget.component.html",
})
export class TaggingWidget {
  @Input() tags: Array<string | TaggingWidgetTagModel> = [];
  @Input() availableTags: Array<string | TaggingWidgetTagModel> = [];
  @Input() allowTagDismissal: boolean = true;
  @Input() clearOnSearch: boolean = false;
  @Input() searchText: string = "";
  @Input() placeHolderText: string = "";

  @Output("textChange") searchTextEmitter = new EventEmitter<string>();
  @Output("onNewSearch") newTagEmitter = new EventEmitter<string | TaggingWidgetTagModel>();
  @Output("onTagDelete") deleteTagEmitter = new EventEmitter<string | TaggingWidgetTagModel>();

  @ViewChild("parent") parent: ElementRef;

  focusRowIndex: number = -1;
  private focusStickerIndex: number = -1; // this.tags.length;

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if(changes["availableTags"]) {
      this.focusRowIndex = -1;
    }
  }

  onSearchTextChange(newValue) {
    this.searchText = newValue;
    this.searchTextEmitter.emit(this.searchText);
  }

  emitSearchText() {
    this.newTagEmitter.emit(this.searchText);
  }

  onKeyDown(event) {
    if ([13, 38, 40].indexOf(event.keyCode) === -1 && this.focusStickerIndex === this.tags.length && event.target.selectionStart) return;
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
    const input = this.parent.nativeElement.querySelector("span.inputSpan input");
    input.value = input.value;
  }

  _manageSelection() {
    if (this.focusRowIndex > -1) {
      this.newTagEmitter.emit(this.availableTags[this.focusRowIndex]);
      this.clearOnSearch && this.onSearchTextChange("");
      this.focusStickerIndex++;
    } else if (this.searchText && this.focusStickerIndex === this.tags.length) {
      this.newTagEmitter.emit(this.searchText);
      this.clearOnSearch && this.onSearchTextChange("");
      this.focusStickerIndex++;
    }
  }

  _manageFocus() {
    if (this.focusStickerIndex < this.tags.length) {
      this.parent.nativeElement.querySelector("span.tagSticker").focus();
      this.focusRowIndex = -1;
    }
    if (this.focusStickerIndex === this.tags.length) {
      this.parent.nativeElement.querySelector("span.inputSpan input").focus();
    }
  }

  removeFocusTag() {
    this.deleteTagEmitter.emit(this.tags.splice(this.focusStickerIndex, 1)[0]);
    setTimeout(() => this._SetCursorAtEnd(), 0);
  }

  onInputFocus() {
    this.focusStickerIndex = this.tags.length;
    this.parent.nativeElement.classList.add("focus");
  }

  onInputBlur() {
    setTimeout(() => this.parent.nativeElement.classList.remove("focus"), 300);
    // this.parent.nativeElement.classList.remove('focus')
  }

  focusOnSticker(i) {
    this.focusStickerIndex = i;
  }
}
