import {Component} from "@angular/core";
import {TaggingWidget} from "../../../../../../../shared/tagging-widget/tagging-widget.component";

@Component({
  selector: 'search-widget',
  templateUrl:'../../../../../../../shared/tagging-widget/tagging-widget.component.html',
  styleUrls: ['../../../../../../../shared/tagging-widget/tagging-widget.component.scss', './search-widget.component.scss']
})
export class SearchWidget extends TaggingWidget {}
