import { Component, OnInit, ViewChild, ElementRef, OnChanges, Input, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-curve';
import {MapData} from '../../../../models/map-data';
import {Status} from '../../../../models/map-data';

import { GeographyService } from '../../../../services/geography.service';

@Component({
  selector: 'dp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [GeographyService]
})
export class MapComponent implements  OnChanges, OnInit{
    map: L.Map;
    @ViewChild('mapcontainer') mapcontainer: ElementRef;
    @Input('mapData') mapData: MapData[] = [];
    markerLookup:L.LatLng[] = [];
    pathLookup=[];

  constructor(
    private geographyService: GeographyService
  ) { }

  ngOnInit() {
    this.map && this.map.remove();
    let mapOptions = {
	    scrollWheelZoom: false,
        zoomControl : false,
        dragging : false,
        boxZoom : false,
        doubleClickZoom : false
	};
    this.geographyService.getCountries().subscribe((countries) => {
    const map = L.map(this.mapcontainer.nativeElement, mapOptions).fitWorld().zoomIn();
    let countriesLayer = L.geoJSON(countries, {
            style: feature => ({
                fillColor: 'rgb(242, 247, 252)',
                fillOpacity: 1,
                weight: 1,
                color: '#FDFDFD'
            })
        }).addTo(map);
            
        map.fitBounds(countriesLayer.getBounds());
        this.map = map;      
      });
           
            
  }
    ngOnChanges(changes : SimpleChanges) {
        if(!changes['mapData'] || !this.map){
            return;
        }
        this.mapData.forEach((data)=>{
            let start = data.start;
            let end = data.end;
            if(!start){
                return;
            }
            this.plotPoint(start);
            if(end){
                this.plotPoint(end);
                this.drawConnection(start, end);
            }

        });
    }
    plotPoint(position){
        let latLng = L.latLng(position.latitude, position.longitude);
        if(this.markerExists(latLng)){
            return;
        }
        this.markerLookup.push(latLng);
        if(position.status === Status.UP){
            L.circleMarker(latLng,{radius: 14, color: '#c4dcec', weight:2, fillColor: '#3fae2a', fillOpacity:0.25}).addTo(this.map);
            L.circleMarker(latLng,{radius: 5, color: 'white', weight:2, fillColor: '#3fae2a', fillOpacity:0.8}).addTo(this.map);
        }else if(position.status === Status.DOWN){
            L.circleMarker(latLng,{radius: 14, color: '#c4dcec', weight:2, fillColor: '#ef6162', fillOpacity:0.25}).addTo(this.map);
            L.circleMarker(latLng,{radius: 5, color: 'white', weight:2, fillColor: '#ef6162', fillOpacity:0.8}).addTo(this.map);
        }else{          
            L.circleMarker(latLng,{radius: 14, color: '#c4dcec', weight:2, fillColor: '#53646a', fillOpacity:0.25}).addTo(this.map);
            L.circleMarker(latLng,{radius: 5, color: 'white', weight:2, fillColor: '#53646a', fillOpacity:0.8}).addTo(this.map);  
        }
    }

    markerExists(latLng){
        for(let i=0;i<this.markerLookup.length;i++){
            let marker = this.markerLookup[i];
            if(marker.lat === latLng.lat && marker.lng === latLng.lng){
                return true;
            }
        }
        return false;
    }

    pathExists(curve){
        for(let i=0;i<this.pathLookup.length;i++){
            let path = this.pathLookup[i];
            if(path.start.latitude === curve.start.latitude && path.start.longitude === curve.start.longitude 
                    && path.end.latitude === curve.end.latitude && path.end.longitude === curve.end.longitude){
                return true;
            }
        }
        return false;
    }

    drawConnection(start, end){
        let midPoint = {x : (start.latitude+end.latitude)/2, y: (start.longitude+end.longitude)/2};
        let distance  = Math.sqrt(Math.pow(end.latitude - start.latitude,2) + Math.pow(end.longitude - start.longitude, 2))
        let path = L.curve(['M',[start.latitude, start.longitude], 'Q',  [midPoint.x + distance/3, midPoint.y + distance/3], [end.latitude, end.longitude]], {color:'#3fae2a', fill:false, dashArray:'1, 5', weight:2});
        if(this.pathExists({start:start, end:end}) || this.pathExists({start:end, end:start})){
            return;
        }       
        this.pathLookup.push({start:start, end:end});
        path.addTo(this.map);      
    }
}