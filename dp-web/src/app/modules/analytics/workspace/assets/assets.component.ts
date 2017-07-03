import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable, Subscription} from 'rxjs/Rx';

import {WorkspaceService} from '../../../../services/workspace.service';
import {WorkspaceDTO} from '../../../../models/workspace-dto';
import {ClusterService} from '../../../../services/cluster.service';
import {Cluster} from '../../../../models/cluster';
import {AssetSetQueryModel} from '../../../dataset/views/ds-assets-list/ds-assets-list.component';
import {WorkspaceAssetsService} from '../../../../services/workspace-assets.service';
import {WorkspaceAsset} from '../../../../models/workspace-assets';
import {DsAssetsService} from '../../../dataset/services/dsAssetsService';
import {DsAssetModel} from '../../../dataset/models/dsAssetModel';
import {CollapsibleNavService} from '../../../../services/collapsible-nav.service';
import {PersonaTabs} from '../../../../models/header-data';

declare var zeppelinURL;

enum AssetViewState {
  ADD_ASSETS, EDIT_ASSETS
}

@Component({
  selector: 'dp-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})

export class AssetsComponent implements OnInit {
  showAssets = false;
  showSelectedAssets = false;
  selectedWorkspaceName: string;
  cluster: Cluster = new Cluster();
  assetViewState = AssetViewState;
  viewState = AssetViewState.ADD_ASSETS;
  workspaceDTO: WorkspaceDTO = new WorkspaceDTO();
  assetSetQueryModelsForAddition: AssetSetQueryModel[] = [];
  workspaceAssetServiceObservable: Observable<WorkspaceAsset[]>;

  constructor(private workspaceService: WorkspaceService,
              private workspaceAssetsService: WorkspaceAssetsService,
              private dsAssetsService: DsAssetsService,
              private clusterService: ClusterService,
              private collapsibleNavService: CollapsibleNavService,
              private activatedRoute: ActivatedRoute) { }

  getAssets() {
    this.workspaceAssetServiceObservable = this.workspaceAssetsService.listAssets(this.workspaceDTO.workspace.id);
  }

  getWorkSpaceDTO() {
    Observable.forkJoin(
      this.workspaceService.getDTOByName(this.selectedWorkspaceName),
      this.clusterService.list()
    ).subscribe((response: any) => {
      this.prepareData(response[0], response[1]);
    });
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.selectedWorkspaceName = params['id'];
      this.getWorkSpaceDTO();
    });
  }

  prepareData(workspaceDTO: WorkspaceDTO, clusters: Cluster[]) {
    this.workspaceDTO = workspaceDTO;
    this.viewState = this.workspaceDTO.counts.asset === 0 ?  AssetViewState.ADD_ASSETS : AssetViewState.EDIT_ASSETS;
    this.cluster = clusters.find(cluster => cluster.name === this.workspaceDTO.clustername);

    this.setNavigation();
    
    if (this.viewState === AssetViewState.EDIT_ASSETS) {
      this.getAssets();
    }
  }

  setNavigation() {
    let zeppelinNotebook = zeppelinURL +
                            '&workspaceId=' +encodeURIComponent(encodeURIComponent(String(this.workspaceDTO.workspace.id))) +
                            '&workspaceName=' +encodeURIComponent(encodeURIComponent(String(this.workspaceDTO.workspace.name)));
    let tabs = [
      new PersonaTabs('Notebooks', zeppelinNotebook, 'fa-file-text-o', false, false),
      new PersonaTabs('Assets', 'workspace/'+ this.selectedWorkspaceName +'/assets', 'fa-list-alt')
    ];
    this.collapsibleNavService.setTabs(tabs, tabs[1]);
  }

  saveSelectedAssets(asqm: AssetSetQueryModel) {
    this.assetSetQueryModelsForAddition.push(asqm);
    this.showAssets = false;
    this.viewState = AssetViewState.EDIT_ASSETS;
    this.saveWorkspaceAsset();
  }

  saveWorkspaceAsset() {
    let workspaceAsset = new WorkspaceAsset();
    workspaceAsset.workspaceId = this.workspaceDTO.workspace.id;
    workspaceAsset.clusterId = this.cluster.id;

    /* This is tmp solution till filters in basic search returns query models*/
    let filters = [{"atlasFilters": DsAssetsService.prototype.getAtlasFilters(this.assetSetQueryModelsForAddition)}];
    if (!filters || filters.length === 0 || !filters[0].atlasFilters || filters[0].atlasFilters.length === 0) {
      workspaceAsset.assetQueryModels = [
        {
          "atlasFilters": [
            {
              "atlasAttribute": {
                "name": "owner",
                "dataType": "string"
              },
              "operation": "equals",
              "operand": "admin"
            }
          ]
        }
      ];
    } else {
      workspaceAsset.assetQueryModels = filters;
    }

    this.workspaceAssetsService.save(workspaceAsset).subscribe(assets => {
      this.getAssets();
    })
  }
}
