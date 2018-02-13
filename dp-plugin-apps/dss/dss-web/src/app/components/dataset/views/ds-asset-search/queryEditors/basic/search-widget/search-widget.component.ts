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

import {Component} from "@angular/core";
import {TaggingWidget} from "../../../../../../../shared/tagging-widget/tagging-widget.component";

@Component({
  selector: "search-widget",
  styleUrls: ["../../../../../../../shared/tagging-widget/tagging-widget.component.scss", "./search-widget.component.scss"],
  templateUrl:"../../../../../../../shared/tagging-widget/tagging-widget.component.html"
})
export class SearchWidget extends TaggingWidget {}
