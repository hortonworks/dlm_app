import {Component} from "@angular/core";
import {TaggingWidget} from "../../../../../../../shared/tagging-widget/tagging-widget.component";

@Component({
  selector: "search-widget",
  styleUrls: ["../../../../../../../shared/tagging-widget/tagging-widget.component.scss", "./search-widget.component.scss"],
  templateUrl:"../../../../../../../shared/tagging-widget/tagging-widget.component.html"
})
export class SearchWidget extends TaggingWidget {}
