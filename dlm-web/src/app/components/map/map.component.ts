/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import {of as observableOf, timer as observableTimer, fromEvent as observableFromEvent, merge as observableMerge,
  Observable, Subscription, race } from 'rxjs';
import {tap, filter, mapTo, take, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {
  Component, OnInit, ViewChild, ElementRef, OnChanges, Input, Output, SimpleChanges, HostBinding, EventEmitter
} from '@angular/core';
import { OnDestroy, HostListener } from '@angular/core';
import * as L from 'leaflet';
import LatLng = L.LatLng;
import 'leaflet-curve';

import { CLUSTER_STATUS } from 'constants/status.constant';
import { CLUSTER_STATUS_COLOR } from 'constants/color.constant';
import { MapSize, MapSizeSettings, ClusterMapData, ClusterMapEntity, ClusterLocationGroups } from 'models/map-data';
import { GeographyService } from 'services/geography.service';
import { Cluster } from 'models/cluster.model';

enum MOUSE_EVENT {
  MOUSE_OVER,
  MOUSE_OUT
}

function getExistingMarker(collection: L.Marker[], latLng: LatLng): L.Marker {
  return collection.find(m => m.getLatLng().lat === latLng.lat && m.getLatLng().lng === latLng.lng);
}

@Component({
  selector: 'dp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [GeographyService]
})
export class MapComponent implements OnChanges, OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  map: L.Map;
  @ViewChild('mapcontainer') mapcontainer: ElementRef;
  @Input() mapData: ClusterMapData[] = [];
  @Input() mapSize = 'extraLarge';
  @Input() sizeSettings: any;
  @Output() clickMarker = new EventEmitter<Cluster[]>();

  @HostBinding('style.height') get selfHeight(): string {
    return this.getMapDimensions().height;
  }

  markerLookup: L.Marker[] = [];
  pathLookup = [];
  countries = [];

  statusColorUp = '#3FAE2A';
  mapColor = '#CFCFCF';

  mapOptions = {
    dragging: true,
    scrollWheelZoom: false
  };

  defaultMapSizes: MapSizeSettings[] = [
    {
      height: '240px',
      width: '420px',
      zoom: 0.5
    },
    {
      height: '360px',
      width: '540px',
      zoom: 1
    },
    {
      height: '480px',
      width: '680px',
      zoom: 1.3
    },
    {
      height: '680px',
      width: '100%',
      zoom: 2
    },
    {
      height: '400px',
      width: '100%',
      zoom: 1.5
    }
  ];

  constructor(private geographyService: GeographyService) {}

  private getClusterById(clusterId): ClusterMapEntity {
    const clusterData = this.mapData.find(clusters => clusters.start.cluster.id === clusterId);
    return clusterData.start.cluster;
  }

  private getStatusColor(cluster: ClusterMapEntity): string {
    return CLUSTER_STATUS_COLOR[cluster.healthStatus];
  }

  private makeMarkerIcon(clusters: ClusterMapEntity[]): L.DivIcon {
    const color = this.getStatusColor(clusters[0]);
    const makeBullet = (cluster) => `<i class="fa fa-circle status-bullet" style="color: ${this.getStatusColor(cluster)};"></i>`;
    return new L.DivIcon({
      iconSize: [23, 40],
      iconAnchor: [12, 39],
      popupAnchor: [0, -20],
      className: 'custom-map-marker',
      html: `
        <div class="marker-wrapper">
          <i class="fa fa-map-marker marker-icon" style="color: ${color};"></i>
          <span class="marker-counter" style="background-color: ${color};">
            ${clusters.length > 1 ? clusters.length : '&nbsp;'}
          </span>
          <div class="status-bullets">
            ${clusters.length > 1 ? clusters.map(makeBullet).join('') : ''}
          </div>
        </div>
      `
    });
  }

  private getMarkerGroupId(clusterInfo: ClusterMapEntity): string {
    return `@${clusterInfo.location.latitude}_${clusterInfo.location.longitude}`;
  }

  private getLocationGroups(): ClusterLocationGroups {
    return this.mapData.reduce((allGroups, clusterData: ClusterMapData) => {
      const startClusterId = this.getMarkerGroupId(clusterData.start.cluster);
      const endClusterId = clusterData.end && this.getMarkerGroupId(clusterData.end.cluster);
      const connection = clusterData.end && [[clusterData.start, clusterData.end]] || [];

      return {
        groups: {
          ...allGroups.groups,
          [startClusterId]: [
            ...(allGroups.groups[startClusterId] || []),
            clusterData.start.cluster
          ],
          ...(endClusterId ? {
            [endClusterId]: [
              ...(allGroups.groups[endClusterId] || []),
              clusterData.end.cluster
            ]
          } : {})
        },
        connections: allGroups.connections.concat(connection)
      };
    }, {groups: {}, connections: []});
  }

  private buildGroupMarkers({ groups }: ClusterLocationGroups): void {
    Object.keys(groups).forEach(groupId => {
      const clusters = groups[groupId];
      const { latitude, longitude } = clusters[0].location;
      const latLng = L.latLng(latitude, longitude);
      this.createMarker(latLng, clusters);
    });
  }

  private formatClusterInfo(cluster: ClusterMapEntity) {
    return `
      <div class="cluster-list-item" data-cluster-id="${cluster.id}">
        <div class="cluster-status">
          <i class="fa fa-circle" style="color: ${this.getStatusColor(cluster)};"></i>
        </div>
        <div class="cluster-description">
          <div class="text-bold">${cluster.dataCenter} / ${cluster.name}</div>
          <small>${cluster.location.city}, ${cluster.location.country}</small>
        </div>
      </div>
    `;
  }

  private formatTooltipHtml(clusters: ClusterMapEntity[]): string {
    return `
      <div class="cluster-list">
        ${clusters.map(cluster => this.formatClusterInfo(cluster)).join('')}
      </div>
    `;
  }

  private buildConnections({connections}: ClusterLocationGroups): void {
    connections.forEach(([start, end]) => this.drawConnection(start, end));
  }

  private sortByStatus(clusters: ClusterMapEntity[]): ClusterMapEntity[] {
    const statusPriority = [
      CLUSTER_STATUS.UNHEALTHY,
      CLUSTER_STATUS.UNKNOWN,
      CLUSTER_STATUS.WARNING,
      CLUSTER_STATUS.HEALTHY];
    return clusters.sort((a, b) =>
      statusPriority.indexOf(a.healthStatus) - statusPriority.indexOf(b.healthStatus));
  }

  private hover$(element): Observable<MOUSE_EVENT> {
    return observableMerge(
      observableFromEvent(element, 'mouseover').pipe(mapTo(MOUSE_EVENT.MOUSE_OVER)),
      observableFromEvent(element, 'mouseout').pipe(mapTo(MOUSE_EVENT.MOUSE_OUT)),
    ).pipe(
    debounceTime(50),
    distinctUntilChanged(), );
  }

  @HostListener('click', ['$event'])
  tooltipItemClick(event) {
    const $target = $(event.target);
    const isClusterItem = $target.hasClass('cluster-list-item') || $target.parents('.cluster-list-item').length;
    if (isClusterItem) {
      const { clusterId } = $target.closest('.cluster-list-item').data();
      if (clusterId) {
        const cluster = this.getClusterById(clusterId);
        this.clickMarker.emit([cluster]);
      }
    }
  }

  getMapDimensions() {
    return this.sizeSettings || this.defaultMapSizes[this.mapSize] || this.defaultMapSizes[MapSize.EXTRALARGE];
  }

  ngOnInit() {
    this.draw();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  draw() {
    if (this.map) {
      this.map.remove();
    }
    this.geographyService.getCountries().subscribe(countries => {
      this.countries = countries;
      this.drawMap(countries);
      this.plotPoints();
      this.fitBounds();
    });
  }

  fitBounds() {
    if (this.markerLookup.length) {
      this.map.fitBounds(L.featureGroup(this.markerLookup).getBounds(), {animate: false});
      if (this.map.getZoom() > 5) {
        this.map.setZoom(5, {animate: false});
      }
    }
  }

  drawMap(countries) {
    const mapDimensions = this.getMapDimensions();
    this.mapcontainer.nativeElement.style.height = mapDimensions.height;
    this.mapcontainer.nativeElement.style.width = mapDimensions.width;
    const map = L.map(this.mapcontainer.nativeElement, this.mapOptions);
    const baseLayer = L
      .geoJSON(countries, {
        style: feature => {
          return {
            fillColor: this.mapColor,
            fillOpacity: 1,
            weight: 1,
            color: '#FDFDFD'
          };
        }
      });
    baseLayer.addTo(map);
    map.fitBounds(baseLayer.getBounds());
    this.map = map;
    this.mapcontainer.nativeElement.querySelector('.leaflet-map-pane').style.height = `${ parseInt(mapDimensions.height, 10) - 20}px`;
  }

  plotPoints() {
    const locationGroups = this.getLocationGroups();
    this.buildGroupMarkers(locationGroups);
    this.buildConnections(locationGroups);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['mapData'] || !this.map) {
      return;
    }
    this.plotPoints();
  }

  plotPoint(position) {
    const cluster = position.cluster;
    const latLng = L.latLng(cluster.location.latitude, cluster.location.longitude);
    this.createMarker(latLng, cluster);
  }

  createMarker(latLng: LatLng, clusters: ClusterMapEntity[]) {
    const sortedClusters = this.sortByStatus(clusters);
    const tooltipContent = this.formatTooltipHtml(sortedClusters);
    const icon = this.makeMarkerIcon(sortedClusters);
    const existingMarker = getExistingMarker(this.markerLookup, latLng);
    if (existingMarker) {
      existingMarker.setPopupContent(tooltipContent);
      existingMarker.setIcon(icon);
    } else {
      const marker = new L.Marker(latLng, {
        icon
      });
      const popup = L.popup({
        closeButton: false,
        maxHeight: 100
      })
      .setContent(tooltipContent);
      this.map.addLayer(marker);
      marker.bindPopup(popup);
      this.markerLookup.push(marker);
      marker.off('click');
      marker.on('mouseover', _ => marker.openPopup());
      marker.on('click', _ => this.clickMarker.emit(clusters));
      popup.on('add', () => {
        popup.bringToFront();
        const CLOSE_POPUP = 'CLOSE_POPUP';
        const tooltipHover$ = this.hover$(marker.getPopup().getElement());
        const tooltipOut$ = tooltipHover$.pipe(
          filter(e => e === MOUSE_EVENT.MOUSE_OUT));
        const closeTooltip$ = this.hover$(marker.getElement()).pipe(
          filter(e => e === MOUSE_EVENT.MOUSE_OUT),
          take(1),
          switchMap(_ =>
            race([
              observableTimer(600).pipe(mapTo(CLOSE_POPUP)),
              tooltipHover$.pipe(filter(e => e === MOUSE_EVENT.MOUSE_OVER))
            ]).pipe(
            switchMap(v => v === CLOSE_POPUP ? observableOf(v) : tooltipOut$.pipe(mapTo(CLOSE_POPUP))))
          ),
          take(1),
          tap(_ => marker.closePopup()), );
        this.subscriptions.push(closeTooltip$.subscribe());
      });
    }
  }

  pathExists(curve) {
    return this.pathLookup.find(path =>
    path.start.latitude === curve.start.latitude &&
    path.start.longitude === curve.start.longitude &&
    path.end.latitude === curve.end.latitude &&
    path.end.longitude === curve.end.longitude);
  }

  drawConnection(start, end) {
    const midPoint = {x: (start.latitude + end.latitude) / 2, y: (start.longitude + end.longitude) / 2};
    const distance = Math.sqrt(Math.pow(end.latitude - start.latitude, 2) + Math.pow(end.longitude - start.longitude, 2));
    const path = L.curve([
        'M',
        [start.latitude, start.longitude],
        'Q',
        [midPoint.x + distance / 3, midPoint.y + distance / 3],
        [end.latitude, end.longitude]],
      {
        color: this.statusColorUp,
        fill: false, dashArray: '1, 5',
        weight: 2
      }
    );

    if (this.pathExists({start, end}) || this.pathExists({start: end, end: start})) {
      return;
    }
    this.pathLookup.push({start, end});
    path.addTo(this.map);
  }
}
