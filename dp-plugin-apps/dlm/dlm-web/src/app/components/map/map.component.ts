import { Component, OnInit, ViewChild, ElementRef, OnChanges, Input, SimpleChanges, HostBinding } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-curve';

import { MapData, MapSize, MapSizeSettings, MapConnectionStatus } from 'models/map-data';
import { GeographyService } from 'services/geography.service';

@Component({
  selector: 'dp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [GeographyService]
})

export class MapComponent implements  OnChanges, OnInit {
  map: L.Map;
  @ViewChild('mapcontainer') mapcontainer: ElementRef;
  @Input('mapData') mapData: MapData[] = [];
  @Input('mapSize') mapSize = 'extraLarge';
  @HostBinding('style.height') get selfHeight(): string {
    return this.getMapDimensions().height;
  }
  markerLookup: L.LatLng[] = [];
  pathLookup = [];
  countries = [];

  statusColorUp = '#3FAE2A';
  statusColorDown = '#EF6162';
  statusColorNA = '#53646A';

  markerColorOuterBorder =  '#C4DCEC';
  markerColorInnerBorder =  '#FFFFFF';

  mapColor = '#CFCFCF';

  mapOptions = {
    scrollWheelZoom: false,
    zoomControl: false,
    dragging: true,
    boxZoom: true,
    doubleClickZoom: true,
    zoomSnap: 0.3
  };

  defaultMapSizes: MapSizeSettings[] = [
    {
      height : '240px',
      width : '420px',
      zoom : 0.5
    },
    {
      height : '360px',
      width : '540px',
      zoom : 1
    },
    {
      height : '480px',
      width : '680px',
      zoom : 1.3
    },
    {
      height : '680px',
      width : '100%',
      zoom : 2
    },
    {
      height: '300px',
      width: '100%',
      zoom: 1.5
    }
  ];

  constructor(
    private geographyService: GeographyService
  ) { }

  getMapDimensions() {
    return this.defaultMapSizes[this.mapSize] || this.defaultMapSizes[MapSize.EXTRALARGE];
  }

  ngOnInit() {
    if (this.map) {
      this.map.remove();
    }
    this.geographyService.getCountries().subscribe( countries => {
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
    const baseLayer =
      L
        .geoJSON(countries, {
          style: feature => {
            if ('properties' in feature && 'name' in feature.properties) {
              const props = <any>feature.properties;
            }
            return {
              fillColor: this.mapColor,
              fillOpacity: 1,
              weight: 1,
              color: '#FDFDFD'
            };
          },
          onEachFeature: (feature, layer) => {
            const props = <any>feature.properties;
            const myLayer = <any>layer;
            const label = L.marker(myLayer.getBounds().getCenter(), {
              icon: L.divIcon({
                className: 'label',
                html: props.name,
                iconSize: [100, 40]
              })
            }).addTo(map);
            myLayer.bindPopup(props.name);
            return myLayer;
          }
        });
    baseLayer.addTo(map);
    map.fitBounds(baseLayer.getBounds());
    this.map = map;
    this.map.setZoom(mapDimensions.zoom);
    this.mapcontainer.nativeElement.querySelector('.leaflet-map-pane').style.height = `${ parseInt(mapDimensions.height, 10) - 20}px`;
  }

  plotPoints() {
    this.mapData.forEach( data => {
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
    const latLng = L.latLng(position.latitude, position.longitude);
    if (this.markerExists(latLng)) {
      return;
    }
    this.markerLookup.push(latLng);
    if (position.status === MapConnectionStatus.UP) {
      this.createMarker(latLng, this.statusColorUp, position.name);
    } else if (position.status === MapConnectionStatus.DOWN) {
      this.createMarker(latLng, this.statusColorDown, position.name);
    } else {
      this.createMarker(latLng, this.statusColorNA, position.name);
    }
  }

  createMarker(latLng, color, popup) {
    L.circleMarker(latLng, {radius: 14, color: this.markerColorOuterBorder, weight: 2,
      fillColor: color, fillOpacity: 0.25}).addTo(this.map).bindPopup(popup);
    L.circleMarker(latLng, {radius: 5, color: this.markerColorInnerBorder, weight: 2,
      fillColor: color, fillOpacity: 0.8}).addTo(this.map);
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
    const midPoint = {x : (start.latitude + end.latitude) / 2, y: (start.longitude + end.longitude) / 2};
    const distance  = Math.sqrt(Math.pow(end.latitude - start.latitude, 2) + Math.pow(end.longitude - start.longitude, 2));
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
