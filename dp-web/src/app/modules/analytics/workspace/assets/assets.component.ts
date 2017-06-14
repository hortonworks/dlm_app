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
  dsAssetsServiceObservable: Observable<DsAssetModel[]>;

  constructor(private workspaceService: WorkspaceService,
              private workspaceAssetsService: WorkspaceAssetsService,
              private dsAssetsService: DsAssetsService,
              private clusterService: ClusterService,
              private activatedRoute: ActivatedRoute) { }

  getAssets() {
    this.workspaceAssetsService.listAssets(this.workspaceDTO.workspace.id).subscribe(results => {
      console.log(results);
    })
  }

  getSelectedAssets() {
    this.showSelectedAssets = true;
    this.dsAssetsServiceObservable = this.dsAssetsService.list(this.assetSetQueryModelsForAddition, 0 , 20, this.cluster.id);
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
    this.cluster = clusters.find(cluster => cluster.name === this.workspaceDTO.clustername);
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
    workspaceAsset.assetQueryModels = this.assetSetQueryModelsForAddition;

    this.workspaceAssetsService.save(workspaceAsset).subscribe(assets => {
      this.getAssets();
    })
  }
}
