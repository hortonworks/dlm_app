import { Component, OnInit, ViewChild, ElementRef, OnChanges, Input, SimpleChanges, HostBinding } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-curve';

import { MapSize, MapSizeSettings, ClusterMapData } from 'models/map-data';
import { GeographyService } from 'services/geography.service';
import LatLng = L.LatLng;
import { CLUSTER_STATUS, SERVICE_STATUS } from 'constants/status.constant';
import { without } from 'utils/array-util';

function formatMapPopup(cluster) {
  const notStartedServices = cluster.status ? cluster.status.filter(s => s.state !== SERVICE_STATUS.STARTED) : [];
  const notStartedServiceNames = notStartedServices.map(s => s.service_name);
  const popup = `<p>${cluster.name}<br />${cluster.dataCenter}<br />Policies: ${cluster.policiesCounter}</p>`;
  if (notStartedServices.length) {
    return `${popup}<p>Not started services: ${notStartedServiceNames.join(', ')}</p>`;
  }
  return popup;
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

  @HostBinding('style.height') get selfHeight(): string {
    return this.getMapDimensions().height;
  }

  markerLookup: L.CircleMarker[] = [];
  smallMarkerLookup: L.CircleMarker[] = [];
  pathLookup = [];
  countries = [];

  statusColorUp = '#3FAE2A';
  statusColorDown = '#EF6162';

  markerColorOuterBorder = '#C4DCEC';
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
    if (this.map) {
      this.map.remove();
    }
    this.geographyService.getCountries()
      // for some reason map don't draw sometimes
      .delay(500)
      .subscribe(countries => {
      this.countries = countries;
      this.drawMap(countries);
      this.plotPoints();
    });
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
    this.map.setZoom(mapDimensions.zoom);
    this.mapcontainer.nativeElement.querySelector('.leaflet-map-pane').style.height = `${ parseInt(mapDimensions.height, 10) - 20}px`;
  }

  plotPoints() {
    this.mapData.forEach(data => {
      const start = data.start;
      const end = data.end;
      if (start) {
        this.plotPoint(start);
      }
      if (start && end) {
        this.plotPoint(end);
        this.drawConnection(start, end);
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

  createMarker(latLng: LatLng, clusterInfo) {
    const marker = L.circleMarker(latLng, {
      radius: 14,
      color: this.markerColorOuterBorder,
      weight: 2,
      fillOpacity: 0.25
    });
    const existingMarker = getExistingMarker(this.markerLookup, latLng);
    if (existingMarker) {
      this.map.removeLayer(existingMarker);
      this.markerLookup = without(this.markerLookup, existingMarker);
    }
    this.markerLookup.push(marker);
    this.map.addLayer(marker);
    const mapPopup = marker.bindPopup(formatMapPopup(clusterInfo));
    mapPopup.on('mouseover', _ => marker.openPopup());
    mapPopup.on('mouseout', _ => marker.closePopup());

    const smallMarker = L.circleMarker(latLng, {
      radius: 5,
      color: this.markerColorInnerBorder,
      weight: 2,
      fillColor: clusterInfo.healthStatus === CLUSTER_STATUS.HEALTHY ? this.statusColorUp : this.statusColorDown,
      fillOpacity: 0.8
    });
    const existingSmallMarker = getExistingMarker(this.smallMarkerLookup, latLng);
    if (existingSmallMarker) {
      this.map.removeLayer(existingSmallMarker);
      this.smallMarkerLookup = without(this.smallMarkerLookup, existingSmallMarker);
    }
    this.smallMarkerLookup.push(smallMarker);
    this.map.addLayer(smallMarker);
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
