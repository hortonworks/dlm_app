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

import {Component, OnInit, ViewChild, ElementRef, OnChanges, Input, SimpleChanges, HostListener} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-curve';

import {MapData, Point} from '../../../../models/map-data';
import {MapDimensions} from '../../../../models/map-data';
import {MapSize} from '../../../../models/map-data';
import {MapConnectionStatus} from '../../../../models/map-data';

import {GeographyService} from '../../../../services/geography.service';
import Layer = L.Layer;
import LayerGroup = L.LayerGroup;
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'dp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [GeographyService]
})

export class MapComponent implements OnChanges, OnInit {
  map: L.Map;
  @ViewChild('mapcontainer') mapcontainer: ElementRef;
  @Input('mapData') mapData: MapData[] = [];
  @Input('mapSize') mapSize: MapSize = MapSize.EXTRALARGE;
  @Input('showCount') showCount = false;

  pathLookup = [];

  statusColorUp = '#3FAE2A';
  statusColorDown = '#EF6162';
  statusColorNA = '#53646A';

  mapColor = '#F2F7FC';

  mapOptions = {
    scrollWheelZoom: true,
    zoomControl: true,
    dragging: true,
    boxZoom: true,
    doubleClickZoom: false,
    zoomSnap: 0.1,
    zoomAnimation: false,
    attributionControl: false
  };

  markers: L.Marker[] = [];
  paths: Layer[] = [];
  markerGroup: LayerGroup;
  pathGroup: LayerGroup;

  private markerMap = new Map();
  private countMap = new Map();

  boundsTimeout = null;

  defaultMapSizes: MapDimensions[] = [
    new MapDimensions('240px', '420px', 0.5),
    new MapDimensions('420px', '540px', 1),
    new MapDimensions('480px', '680px', 1.3),
    new MapDimensions('500px', '100%', 1.54)
  ];

  constructor(private geographyService: GeographyService) {
  }

  ngOnInit() {
    //The TRANSITION is causing a horizontal scrollbar disabling for now via hack
    L.DomUtil['TRANSITION'] = 'unused';
    if (this.map) {
      this.map.remove();
    }
    this.geographyService.getCountries().subscribe((countries) => {
      this.drawMap(countries);
      if (this.mapData) {
        this.mark();
      }
    });
  }

  drawMap(countries) {
    let mapDimensions = this.defaultMapSizes[this.mapSize] || this.defaultMapSizes[MapSize.EXTRALARGE];
    this.mapcontainer.nativeElement.style.height = mapDimensions.height;
    this.mapcontainer.nativeElement.style.width = mapDimensions.width;
    const map = L.map(this.mapcontainer.nativeElement, this.mapOptions);
    let countriesLayer = L.geoJSON(countries, {
      style: feature => ({
        fillColor: this.mapColor,
        fillOpacity: 1,
        weight: 1,
        color: '#D0D3D7'
      })
    }).addTo(map);
    map.fitBounds(countriesLayer.getBounds());
    this.map = map;
    this.map.setZoom(mapDimensions.zoom);
  }

  fitBounds() {
    if (this.markers && this.markers.length) {

      if (this.markers.length === 1) {
        let latLng = this.markers[0].getLatLng();
        this.map.setView(latLng, 4);
      }

      this.map.fitBounds(L.featureGroup(this.markers).getBounds(), {padding: [40, 40],animate: false});
      if (this.map.getZoom() > 5) {
        this.map.setZoom(5, {animate: false});
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['mapData'] || !this.map) {
      return;
    }
    console.log(this.mapData);
    this.mark()
  }

  mark() {
    if (this.boundsTimeout) {
      clearTimeout(this.boundsTimeout);
    }
    //this.markerMap = new Map();
    //this.removeExistingMarker();
    this.countMap = new Map();
    this.mapData.forEach((data) => {
      let start = data.start;
      // let key = `${start.latitude}-${start.longitude}`;
      // let value = this.markerMap.get(key);
      // if(value){
      //   this.update(data.start, value);
      //   //return;
      // }
      let end = data.end;
      if (start) {
        this.plotPoint(start);
      }
      if (start && end) {
        this.plotPoint(end);
        this.drawConnection(start, end);
      }
    });
    this.markerGroup = L.layerGroup(this.markers);
    this.pathGroup = L.layerGroup(this.paths);
    this.boundsTimeout = setTimeout(() => this.fitBounds(), 10);

  }

  update(point: Point, data: MarkerData) {
    //  console.log("updating marker", data);
    let marker = data.marker;
    // marker.setIcon(this.getMarkerIcon(data.count, data))
  }

  createPopup(marker, data: MarkerData) {
    const makeList = (cluster) => `<div class="details-container">
         <div class="status"><i class="fa fa-circle" style="color:${this.getStatusColor(cluster.status)}"></i> ${cluster.datacenter} / ${cluster.name}</div> 
         <div class="location">${data.point.location}</div>
       </div>`;
    let html = `<div class="pop-up-container">${data.clusters.map(makeList).join('')}</div>`;
    marker.bindTooltip(html, {
      direction: 'auto',
      offset: [10, 0]
    });
  }

  private getStatusColor(status) {
    let color;
    if (status === MapConnectionStatus.UP) {
      color = this.statusColorUp;
    } else if (status === MapConnectionStatus.DOWN) {
      color = this.statusColorDown;
    } else {
      color = this.statusColorNA;
    }
    return color;
  }

  plotPoint(position: Point) {
    let latLng = L.latLng(position.latitude, position.longitude);
    let key = `${position.latitude}-${position.longitude}`;
    let existingCount = this.countMap.get(key);
    let count = existingCount? existingCount + 1 : 1;
    console.log(count);
    this.countMap.set(key, count);
    let existingMarkerData = this.markerMap.get(key);
    if (!existingMarkerData) {
      console.log("create marker")
      let clusterInfo = new ClusterInfo(position.clusterName, position.status, position.datacenter);
      let count = 1;
      let clusters = [clusterInfo];
      let markerData = new MarkerData(position, count, clusters);
      let marker = this.createMarker(latLng, count, markerData);
      this.markerMap.set(key, new MarkerData(position, count, clusters, marker));
      if (position.datacenter && position.location) {
        this.createPopup(marker, markerData);
      }
    } else {
      let existingClusters = existingMarkerData.clusters;
      let existingCluster = existingClusters.find(exCluster => exCluster.name === position.clusterName && exCluster.datacenter === position.datacenter)
      if (existingCluster) {
        this.updateStatus(existingMarkerData, position);
      }else {
        let clusterInfo = new ClusterInfo(position.clusterName, position.status, position.datacenter);
        let clusters = existingMarkerData.clusters.concat([clusterInfo]);
        this.updateCount(existingMarkerData, position);
        // let count = existingMarkerData.count + 1;
        // let clusterInfo = new ClusterInfo(position.clusterName, position.status, position.datacenter);
        // let clusters = existingMarkerData.clusters.concat([clusterInfo]);
      }

    }
    // let count = existingMarkerData ? existingMarkerData.count + 1 : 1;
    // let clusterInfo = new ClusterInfo(position.clusterName, position.status, position.datacenter);
    // let clusters = existingMarkerData ? existingMarkerData.clusters.concat([clusterInfo]) : [clusterInfo];
    // let markerData = new MarkerData(position, count, clusters);
    // this.markerMap.set(key, markerData);
    // let marker = this.createMarker(latLng);
    // // markerData = new MarkerData(position, count, clusters, marker);
    // if (position.datacenter && position.location) {
    //   this.createPopup(marker, markerData);
    // }
  }

  private createMarker(latLng, count, markerData) {
    let marker = L.marker(latLng, {
      icon: this.getMarkerIcon(count, markerData),
    }).addTo(this.map);
    this.markers.push(marker);
    return marker;
  }

  private updateMarker(markerData) {

  }

  private updateStatus(markerData, position: Point){
    console.log("update status")

  }

  private updateCount(markerData, position: Point){
    console.log("update count");
    let marker = markerData.marker;
    markerData.count = markerData.count + 1;
    //marker.setIcon(this.getMarkerIcon(1, markerData));
  }

  removeExistingMarker() {
    this.markers = [];
    this.paths = [];
    if (this.markerGroup) {
      this.markerGroup.eachLayer(layer => {
        layer.remove();
      });
    }
    if (this.pathGroup) {
      this.pathGroup.eachLayer(layer => {
        layer.remove();
      });
    }
    this.pathLookup = [];
  }

  private getMarkerIcon(count, markerData: MarkerData) {
    let statusCountArr = [];
    console.log(markerData.clusters);
    markerData.clusters.map(cluster => {
      statusCountArr[cluster.status] = statusCountArr[cluster.status] ? statusCountArr[cluster.status] + 1 : 1;
    });
    const makeStatusBullets = (cluster) => `<div class="status-bullet" style="background-color: ${this.getStatusColor(cluster.status)};">${statusCountArr[cluster.status]}</div>`;
    let html = `<div class="marker-wrapper">
                <i class="fa fa-map-marker marker-icon" ></i>
                <span class="marker-counter">
                  ${this.showCount ? count : ''}
                </span>
                <span></span>
                <div class="status-bullets">
                   ${this.showCount ? markerData.clusters.map(makeStatusBullets).join('') : ''}
                </div>
                
          </div>`;
    return L.divIcon(({
      iconSize: null,
      iconAnchor: [0, 0],
      className: 'custom-map-marker',
      html: html
    }));
  }

  private pathExists(curve) {
    return this.pathLookup.find(path => {
      return path.start.latitude === curve.start.latitude && path.start.longitude === curve.start.longitude
        && path.end.latitude === curve.end.latitude && path.end.longitude === curve.end.longitude;
    });
  }

  drawConnection(start, end) {
    let midPoint = {x: (start.latitude + end.latitude) / 2, y: (start.longitude + end.longitude) / 2};
    let distance = Math.sqrt(Math.pow(end.latitude - start.latitude, 2) + Math.pow(end.longitude - start.longitude, 2));
    let path = L.curve(
      ['M', [start.latitude, start.longitude], 'Q', [midPoint.x + distance / 3, midPoint.y + distance / 3], [end.latitude, end.longitude]],
      {
        color: this.statusColorUp,
        fill: false,
        dashArray: '1, 5',
        weight: 2
      });
    if (this.pathExists({start: start, end: end}) || this.pathExists({start: end, end: start})) {
      return;
    }
    this.pathLookup.push({start: start, end: end});
    path.addTo(this.map);
    this.paths.push(path);
  }
}

export class MarkerData {
  constructor(public point: Point, public count: number, public clusters: any[], public marker?: L.Marker) {
  };
}

export class ClusterInfo {
  constructor(public name: string, public status: MapConnectionStatus, public datacenter: string) {
  }
}
