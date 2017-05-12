import {Component} from "@angular/core";
import {TaggingWidget} from "../../../../../../../shared/tagging-widget/tagging-widget.component";

var SearchWidgetInjection = {
  selector: 'search-widget',
  templateUrl:'../../../../../../../shared/tagging-widget/tagging-widget.component.html',
  styleUrls: ['../../../../../../../shared/tagging-widget/tagging-widget.component.scss', './search-widget.component.scss']
}
//SearchWidgetInjection.styleUrls.push('./search-widget.component.scss');
@Component(SearchWidgetInjection)
export class SearchWidget extends TaggingWidget {}
