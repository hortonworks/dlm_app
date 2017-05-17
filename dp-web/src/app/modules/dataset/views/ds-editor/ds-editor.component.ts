import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {RichDatasetService} from "../../services/RichDatasetService";
import {DsTagsService} from "../../services/dsTagsService";

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
  public tags:string[] = [];

  constructor(
    public dsModel: RichDatasetModel,
    private richDatasetService :RichDatasetService,
    private tagService: DsTagsService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ){}

  ngOnInit () {
    this.activeRoute.params.subscribe(params => {this.datasetId = +params['id'];});
    if(isNaN(this.datasetId))this.router.navigate(['dataset/add']);
    else
      this.richDatasetService.getById(this.datasetId).subscribe(dsModel => {
        this.dsModel = dsModel
        this.tagService.listDatasetTags(this.dsModel.id).subscribe(tags=> this.tags=tags);
      });
  }
  setVisibilityOfNext() {
    this.nextIsVisible = (this.currentStage == 1 || this.currentStage == 2  && this.dsModel.id != undefined);
  }
  actionNext(){
    if(!this['validateStage'+this.currentStage]()) return;
    ++ this.currentStage;
    this.setVisibilityOfNext()
  }
  actionSave(){console.log("ds editor save clicked")}
  actionCancel(){this.router.navigate(['dataset']);}
  validateStage1 () {return this.dsModel.name && this.dsModel.description && this.dsModel.datalakeId}
  validateStage2 () {return true}
  validateStage3 () {return true}

}
