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

import {Component, OnInit, ViewChild, ElementRef, OnChanges, Input, SimpleChanges} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-curve';

import {MapData} from '../../../../models/map-data';
import {MapDimensions} from '../../../../models/map-data';
import {MapSize} from '../../../../models/map-data';
import {MapConnectionStatus} from '../../../../models/map-data';

import {GeographyService} from '../../../../services/geography.service';
import Layer = L.Layer;
import LayerGroup = L.LayerGroup;

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

  markerLookup: L.LatLng[] = [];
  pathLookup = [];

  statusColorUp = '#3FAE2A';
  statusColorDown = '#EF6162';
  statusColorNA = '#53646A';

  markerColorOuterBorder = '#C4DCEC';
  markerColorInnerBorder = '#FFFFFF';

  mapColor = '#F2F7FC';

  mapOptions = {
    scrollWheelZoom: false,
    zoomControl: false,
    dragging: false,
    boxZoom: false,
    doubleClickZoom: false,
    zoomSnap: 0.1,
    zoomAnimation: false
  };

  markerAndCurveLayer: Layer[] = [];
  layerGroup: LayerGroup;

  defaultMapSizes: MapDimensions[] = [
    new MapDimensions('240px', '420px', 0.5),
    new MapDimensions('420px', '540px', 1),
    new MapDimensions('480px', '680px', 1.3),
    new MapDimensions('500px', '59%', 1.54)
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
        color: this.mapColor
      })
    }).addTo(map);
    map.fitBounds(countriesLayer.getBounds());
    this.map = map;
    this.map.setZoom(mapDimensions.zoom);
    this.mapcontainer.nativeElement.querySelector('.leaflet-map-pane').style.height = `${parseInt(mapDimensions.height, 10) - 20}px`;
    this.mapcontainer.nativeElement.querySelector('.leaflet-overlay-pane').style.height = `${parseInt(mapDimensions.height, 10) - 20}px`;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['mapData'] || !this.map) {
      return;
    }
    this.removeExistingMarker();
    this.mapData.forEach((data) => {
      let start = data.start;
      let end = data.end;
      if (start) {
        this.plotPoint(start);
      }
      if (start && end) {
        this.plotPoint(end);
        this.drawConnection(start, end);
      }
    });
    this.layerGroup = new L.LayerGroup(this.markerAndCurveLayer);
  }

  plotPoint(position) {
    let latLng = L.latLng(position.latitude, position.longitude);
    if (this.markerExists(latLng)) {
      return;
    }
    this.markerLookup.push(latLng);
    if (position.status === MapConnectionStatus.UP) {
      this.createMarker(latLng, this.statusColorUp);
    } else if (position.status === MapConnectionStatus.DOWN) {
      this.createMarker(latLng, this.statusColorDown);
    } else {
      this.createMarker(latLng, this.statusColorNA);
    }
  }

  removeExistingMarker() {
    if (this.layerGroup) {
      this.layerGroup.eachLayer(layer => {
        this.map.removeLayer(layer);
      });
    }
    this.markerLookup = [];
    this.pathLookup = [];
  }

  createMarker(latLng, color) {
    let outerMarker = L.circleMarker(latLng, {
      radius: 14,
      color: this.markerColorOuterBorder,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.25
    }).addTo(this.map);
    let innerMarker = L.circleMarker(latLng, {
      radius: 5,
      color: this.markerColorInnerBorder,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.8
    }).addTo(this.map);
    this.markerAndCurveLayer.push(outerMarker);
    this.markerAndCurveLayer.push(innerMarker);
  }

  markerExists(latLng) {
    return this.markerLookup.find(marker => {
      return marker.lat === latLng.lat && marker.lng === latLng.lng;
    });
  }

  pathExists(curve) {
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
    this.markerAndCurveLayer.push(path);
  }
}
