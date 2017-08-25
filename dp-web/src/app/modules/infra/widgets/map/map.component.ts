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


class MapVertex {
  constructor(
    public id: string,
    public latitude: number,
    public longitude: number,
    public meta: object,
  ) {}
}

class MapEdge {
  constructor(
    public id: string,
    public sourceId: string,
    public targetId: string,
    public meta: object,
  ) {}
}

const ClusterIcon = L.Icon.extend({
  options: {
    // @section
    // @aka DivIcon options
    iconSize: [12, 12], // also can be set through CSS

    // iconAnchor: (Point),
    // popupAnchor: (Point),

    // @option html: String = ''
    // Custom HTML code to put inside the div element, empty by default.
    html: false,

    // @option bgPos: Point = [0, 0]
    // Optional relative position of the background, in pixels
    bgPos: null,

    className: 'dp-leaflet-clusters-icon',

    clusters: []
  },

  createIcon: function (oldIcon) {
    var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
        options = this.options;

    div.innerHTML = options.html !== false ? options.html : '';

    if (options.bgPos) {
      var bgPos = L.point(options.bgPos);
      div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px';
    }
    this._setIconStyles(div, 'icon');

    return div;
  },

  createShadow: function () {
    return null;
  }
})


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
  @Input('mapSize') size: MapSize = MapSize.EXTRALARGE;

  vertices: MapVertex[];
  edges: MapEdge[];

  markerLookup: L.LatLng[] = [];
  pathLookup = [];

  statusColorUp = '#3FAE2A';
  statusColorDown = '#EF6162';
  statusColorNA = '#53646A';

  markerColorOuterBorder = '#C4DCEC';
  markerColorInnerBorder = '#FFFFFF';

  MAP_COLOR = '#F2F7FC';

  MAP_OPTIONS = {
    scrollWheelZoom: false,
    zoomControl: false,
    dragging: false,
    boxZoom: false,
    doubleClickZoom: false,
    zoomSnap: 0.1,
    zoomAnimation: false,
    attributionControl: false
  };

  MAP_SIZES = {
    [MapSize.SMALL] :new MapDimensions('240px', '420px', 0.5),
    [MapSize.MEDIUM] :new MapDimensions('420px', '540px', 1),
    [MapSize.LARGE] :new MapDimensions('480px', '680px', 1.3),
    [MapSize.EXTRALARGE] :new MapDimensions('500px', '59%', 1.54)
  };

  constructor(private geographyService: GeographyService) {
    this.vertices = [
      new MapVertex('0', 12.96999454498291, 77.56001281738281, {}),
      new MapVertex('1', 12.96999454498291, 77.56001281738281, {}),
    ];
    this.edges = [];
  }

  ngOnInit() {
    //The TRANSITION is causing a horizontal scrollbar disabling for now via hack
    L.DomUtil['TRANSITION'] = 'unused';
    if (this.map) {
      this.map.remove();
    }
    this.geographyService
      .getCountries()
      .subscribe(geoJSON => {
        const dimension = this.MAP_SIZES[this.size] || this.MAP_SIZES[MapSize.EXTRALARGE];

        const container = this.mapcontainer.nativeElement;

        this.map = this.getDrawnMap(container, dimension, geoJSON);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['mapData'] || !this.map) {
      return;
    }
    const vertices = this.vertices;
    const edges = this.edges;

    const markers = vertices.reduce((markerMap, cVertex) => Object.assign({}, markerMap, {
      [cVertex.id]: this.getDrawnVertex(cVertex)
    }), {});
    const arcs = edges.reduce((arcMap, cEdge) => Object.assign({}, arcMap, {
      [cEdge.id]: this.getDrawnEdge(vertices, cEdge)
    }), {});

    const mLayer = L.layerGroup(Object.keys(markers).map(cMarkerKey => markers[cMarkerKey]));
    this.map.addLayer(mLayer)
  }

  getDrawnMap(container, dimension, geoJSON): L.Map {
    const map = L.map(container, this.MAP_OPTIONS);
    const baseLayer = this.getBaseLayer(geoJSON);
    map.addLayer(baseLayer);
    map.fitBounds(baseLayer.getBounds());
    map.setZoom(dimension.zoom);

    return map;
  }

  getBaseLayer(geoJSON): L.GeoJSON {
    return L.geoJSON(geoJSON, {
      style: feature => ({
        fillColor: this.MAP_COLOR,
        fillOpacity: 1,
        weight: 1,
        color: this.MAP_COLOR
      }),
      pane: 'tilePane',
    })
  }

  private getDrawnVertex(vertex: MapVertex): L.CircleMarker {
    const position = L.latLng(vertex.latitude, vertex.longitude);

    return L.circleMarker(position, {
      radius: 5,
      color: this.markerColorInnerBorder,
      weight: 2,
      fillColor: 'red',
      fillOpacity: 0.8
    })
  }

  private getDrawnEdge(vertices: MapVertex[], edge: MapEdge) {
    const sourceVertex = vertices.find(cVertex => cVertex.id === edge.sourceId);
    const targetVertex = vertices.find(cVertex => cVertex.id === edge.targetId);
    return this.drawConnection(sourceVertex, targetVertex, edge.meta);
  }

  drawConnection(sourceVertex: MapVertex, targetVertex: MapVertex, meta: object): L.Path {
    const start = sourceVertex;
    const end = targetVertex;
    let midPoint = {x: (start.latitude + end.latitude) / 2, y: (start.longitude + end.longitude) / 2};
    let distance = Math.sqrt(Math.pow(end.latitude - start.latitude, 2) + Math.pow(end.longitude - start.longitude, 2));
    return L.curve(
      ['M', [start.latitude, start.longitude], 'Q', [midPoint.x + distance / 3, midPoint.y + distance / 3], [end.latitude, end.longitude]],
      {
        color: this.statusColorUp,
        fill: false,
        dashArray: '1, 5',
        weight: 2
      });
  }

  get mapSizeAsString(): string {
    return MapSize[this.size];
  }
}
