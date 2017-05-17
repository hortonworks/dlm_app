import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";



export var TaggingWidgetInjection = {
  selector: 'tagging-widget',
  templateUrl:'./tagging-widget.component.html',
  styleUrls: ['./tagging-widget.component.scss']

}

export class TaggingWidgetTagModel {
  constructor(public display: string, public data?: any) {}
}


@Component({
  selector: 'tagging-widget',
  templateUrl:'./tagging-widget.component.html',
  styleUrls: ['./tagging-widget.component.scss']

})
export class TaggingWidget {
  @Input() tags:(string|TaggingWidgetTagModel)[];
  @Input() availableTags:(string|TaggingWidgetTagModel)[] = [];
  @Input() allowTagDismissal:boolean = true;
  @Input() clearOnSearch:boolean = false;

  @Output('textChange') searchTextEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output('onNewSearch') newTagEmitter: EventEmitter<string|TaggingWidgetTagModel> = new EventEmitter<string|TaggingWidgetTagModel>();
  @Output('onTagDelete') deleteTagEmitter: EventEmitter<string|TaggingWidgetTagModel> = new EventEmitter<string|TaggingWidgetTagModel>();

  @ViewChild('parent') parent:ElementRef;

  public searchText:string="";


  private focusStickerIndex:number = -1;//this.tags.length;
  public focusRowIndex:number = -1;
  onSearchTextChange (newValue) {
    this.searchText = newValue;
    this.searchTextEmitter.emit(this.searchText);
  }
  onKeyDown(event){
    if([13,38,40].indexOf(event.keyCode) == -1 && this.focusStickerIndex==this.tags.length && event.target.selectionStart) return;
    // console.log(event.key, event.keyCode, event.target.selectionStart);
    switch(event.keyCode) {
      case 8  :
      case 46 :  if (this.allowTagDismissal && this.focusStickerIndex < this.tags.length) this.removeFocusTag();
      case 37 :  if (this.allowTagDismissal) this.focusStickerIndex = Math.max(0, this.focusStickerIndex-1); break;
      case 39 :  if (this.allowTagDismissal) this.focusStickerIndex = Math.min(this.tags.length, this.focusStickerIndex+1); break;

      case 38 :  this.focusRowIndex = Math.max(-1, this.focusRowIndex-1); event.stopPropagation();
                  (function(thisObj){setTimeout(function(){thisObj._SetCursorAtEnd()}, 0)})(this); break;
      case 40  :  this.focusRowIndex = Math.min(this.availableTags.length-1, this.focusRowIndex+1);event.stopPropagation(); break;
      case 13  :  this._manageSelection();
    }
    (function(thisObj){setTimeout(function(){thisObj._manageFocus()}, 0)})(this);
  }
  _SetCursorAtEnd () {
    var input = this.parent.nativeElement.querySelector('span.inputSpan input');
    input.value = input.value;
  }
  _manageSelection () {
    if(this.focusRowIndex > -1) {
      this.newTagEmitter.emit(this.availableTags[this.focusRowIndex]);
      this.clearOnSearch && this.onSearchTextChange("");
    }
    else if(this.focusStickerIndex == this.tags.length) {
      this.newTagEmitter.emit(this.searchText);
      this.clearOnSearch && this.onSearchTextChange("");
    }
  }
  _manageFocus() {
    if(this.focusStickerIndex < this.tags.length) {
      this.parent.nativeElement.querySelector('span.tagSticker').focus();
      this.focusRowIndex = -1;
    }
    if(this.focusStickerIndex == this.tags.length)
      this.parent.nativeElement.querySelector('span.inputSpan input').focus();
  }
  removeFocusTag () {
    this.deleteTagEmitter.emit(this.tags.splice(this.focusStickerIndex,1)[0]);
    (function(thisObj){setTimeout(function(){thisObj._SetCursorAtEnd()}, 0)})(this);
  }
  onInputFocus(){
    this.focusStickerIndex=this.tags.length;
    this.parent.nativeElement.classList.add('focus')
  }
  onInputBlur(){
    (function(thisObj){setTimeout(function(){thisObj.parent.nativeElement.classList.remove('focus')}, 300)})(this);
    // this.parent.nativeElement.classList.remove('focus')
  }
  focusOnSticker(i) {
    this.focusStickerIndex=i;
  }
}
