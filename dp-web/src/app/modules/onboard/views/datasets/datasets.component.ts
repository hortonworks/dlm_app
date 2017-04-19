
import {Component, Input, OnInit, Output, EventEmitter} from "@angular/core";
import {DataSet} from "../../../../models/data-set";
import {LakeService} from "../../../../services/lake.service";
import {Lake} from "../../../../models/lake";
import {ActivatedRoute, Router} from "@angular/router";
import {CategoryService} from "../../../../services/category.service";
import {Category} from "../../../../models/category";
import {DataSetService} from "../../../../services/dataset.service";


@Component({
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss'],
  providers:[DataSet, Category]
})
export class DataSetComponent implements OnInit {

  datasetId : number;
  lakes : Lake[];
  categories : Category[] = [];
  selectedCategoryIds : number[] = [];
  showCategoryEditor : boolean = false;
  constructor(
    public dataSet : DataSet,
    public newCategory : Category,
    private lakeService: LakeService, // for list of available data lakes
    private categoryService : CategoryService, // for list of available categories
    private datasetService : DataSetService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit () {
    //find datasetId in case of edit flow
    this.activeRoute.params.subscribe(params => {this.datasetId = +params['id'];});
    // if no id redirect to add flow
    if(isNaN(this.datasetId))this.router.navigate(['onboard/dataset-add']);
    else { // load editor with datasets and categories
      this.datasetService.get(this.datasetId).subscribe(dtSetNCtgs => {
        this.dataSet = dtSetNCtgs.dataset;
        this.selectedCategoryIds = dtSetNCtgs.categories.map(ctgry => ctgry.id);
        this._updateCheckBox();
      });
    }
    this.lakeService.list().subscribe(lakes => this.lakes=lakes);
    this.categoryService.list().subscribe(categories => {this.categories=categories; this._updateCheckBox()});
  }
  _updateCheckBox () {
    if(!this.categories.length || !this.selectedCategoryIds.length) return;
    this.categories=this.categories.map(ctgry => {(<any>ctgry).checked=(this.selectedCategoryIds.indexOf(ctgry.id)>-1); return ctgry});
  }
  onSelectedCategoriesChange (selections: any[]) {
    this.selectedCategoryIds = selections.filter(ctgry => ctgry.checked).map(ctgry => ctgry.id);
  }

  onDataLakeIdChange () {this.dataSet.datalakeId = +this.dataSet.datalakeId}

  _validateNewCategory () {return this.newCategory.name && this.newCategory.description}
  saveCategory () {
    if(!this._validateNewCategory()) return console.log("Invalid Category Definition")
    this.categoryService.insert(this.newCategory)
      .subscribe(
        res => {this.categories.push(res); this.showCategoryEditor=false; this._updateCheckBox()},
        error => {console.log(error)}
      );
  }

  onCancel () {this.router.navigate(['onboard']);}

  _validate() {
    return this.dataSet.name && this.dataSet.description && this.dataSet.datalakeId && this.selectedCategoryIds.length
  }
  onSave (calback) {
    if(!this._validate()) return console.log("Invalid Dataset Definition")
    this.datasetService[(isNaN(this.datasetId))?"post":"put"]({dataset:this.dataSet, categories:this.selectedCategoryIds})
      .subscribe(
        res => {console.log(res);this.router.navigate(['onboard/dataset-edit/'+res.dataset.id]);},
        error => {console.log(error)}
      );
  }
  onSaveNContinue () {

  }

}
