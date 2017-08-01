import {
  Component, OnInit, ViewChild, ElementRef, OnChanges, Input, Output, SimpleChanges, HostBinding, EventEmitter
} from '@angular/core';
import { CLUSTER_STATUS_COLOR } from 'constants/color.constant';
import * as L from 'leaflet';
import 'leaflet-curve';

import { MapSize, MapSizeSettings, ClusterMapData } from 'models/map-data';
import { GeographyService } from 'services/geography.service';
import LatLng = L.LatLng;
import { Cluster } from 'models/cluster.model';
import { CLUSTER_STATUS, SERVICE_STATUS } from 'constants/status.constant';
import { without } from 'utils/array-util';

function formatMapPopup(cluster) {
  return `<span>${cluster.name} ${cluster.dataCenter} / ${cluster.policiesCounter}</span>`;
}

function getExistingMarker(collection: L.CircleMarker[], latLng: LatLng): L.CircleMarker {
  return collection.find(m => m.getLatLng().lat === latLng.lat && m.getLatLng().lng === latLng.lng);
}

@Component({
  selector: 'dp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [GeographyService]
})
export class MapComponent implements OnChanges, OnInit {
  map: L.Map;
  @ViewChild('mapcontainer') mapcontainer: ElementRef;
  @Input('mapData') mapData: ClusterMapData[] = [];
  @Input('mapSize') mapSize = 'extraLarge';
  @Input() sizeSettings: any;
  @Output() clickMarker = new EventEmitter<Cluster>();

  @HostBinding('style.height') get selfHeight(): string {
    return this.getMapDimensions().height;
  }

  markerLookup: L.CircleMarker[] = [];
  pathLookup = [];
  countries = [];

  statusColorUp = '#3FAE2A';
  markerColorInnerBorder = '#FFFFFF';
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

  constructor(private geographyService: GeographyService) {
  }

  getMapDimensions() {
    return this.sizeSettings || this.defaultMapSizes[this.mapSize] || this.defaultMapSizes[MapSize.EXTRALARGE];
  }

  ngOnInit() {
    this.draw();
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
    this.mapData.forEach(data => {
      const start = data.start;
      const end = data.end;
      if (start) {
        this.plotPoint(start);
        if (end) {
          this.plotPoint(end);
          this.drawConnection(start, end);
        }
      }
    });
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

  createMarker(latLng: LatLng, clusterInfo: Cluster) {
    const marker = L.circleMarker(latLng, {
      radius: 7,
      color: this.markerColorInnerBorder,
      weight: 0,
      fillColor: CLUSTER_STATUS_COLOR[clusterInfo.healthStatus],
      fillOpacity: 0.8
    });
    const existingMarker = getExistingMarker(this.markerLookup, latLng);
    if (existingMarker) {
      this.map.removeLayer(existingMarker);
      this.markerLookup = without(this.markerLookup, existingMarker);
    }
    this.markerLookup.push(marker);
    this.map.addLayer(marker);
    const mapPopup = marker.bindPopup(formatMapPopup(clusterInfo), { closeButton: false });
    mapPopup.on('mouseover', _ => marker.openPopup());
    mapPopup.on('mouseout', _ => marker.closePopup());
    mapPopup.on('click', _ => this.clickMarker.emit(clusterInfo));
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
