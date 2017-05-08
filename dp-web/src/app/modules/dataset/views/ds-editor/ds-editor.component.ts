import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {RichDatasetService} from "../../services/RichDatasetService";

@Component({
  selector: 'ds-editor',
  templateUrl: './ds-editor.component.html',
  styleUrls: ['./ds-editor.component.scss'],
  providers:[RichDatasetModel]
})
export class DsEditor implements OnInit {

  public currentStage:number = 1;
  private datasetId:number = null;
  public nextIsVisible:boolean = true;
  constructor(
    public dsModel: RichDatasetModel,
    private richDatasetService :RichDatasetService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ){}

  ngOnInit () {
    this.activeRoute.params.subscribe(params => {this.datasetId = +params['id'];});
    if(isNaN(this.datasetId))this.router.navigate(['dataset/add']);
    else
      this.richDatasetService.getById(this.datasetId).subscribe(dsModel => this.dsModel=dsModel);
  }
  setVisibilityOfNext() {
    this.nextIsVisible = (this.currentStage == 1 || this.currentStage == 2  && this.dsModel.id != undefined);
  }
  actionNext(){
    ++ this.currentStage;
    this.setVisibilityOfNext()
  }
  actionSave(){console.log("ds editor save clicked")}
  actionCancle(){console.log("ds editor cancle clicked")}

}
