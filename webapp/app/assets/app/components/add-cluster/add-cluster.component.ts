/**
 * Created by rksv on 22/11/16.
 */
import {Component, AfterViewInit, OnInit, ViewChild, ElementRef} from '@angular/core';
import {CityNames} from '../../common/utils/city-names';
import {ClusterService} from '../../services/cluster.service';
import {Cluster} from '../models/cluster';

declare var Datamap:any;

@Component({
    selector: 'add-cluster' ,
    styleUrls: ['assets/app/components/add-cluster/add-cluster.component.css'],
    templateUrl: 'assets/app/components/add-cluster/add-cluster.component.html'
})

export default class AddClusterComponent implements AfterViewInit, OnInit {

    map: any;
    clusters: Cluster[] = [];
    cityNames: string[] = [];
    cluster: Cluster = new Cluster();
    countryNames = Datamap.prototype.worldTopo.objects.world.geometries;

    @ViewChild('selectCity') selectCity: ElementRef;

    constructor(private clusterService: ClusterService) {}

    ngOnInit() {
        this.clusterService.get().subscribe((cluster: Cluster[]) => {
            this.clusters = cluster;
        });
    }

    ngAfterViewInit() {
        this.map = new Datamap({element: document.getElementById('map'),projection: 'mercator',
            fills: {
                defaultFill: '#E5E5E5'
            },
            bubblesConfig: {
                popupTemplate: function(geography: any, data: any) {
                    return '<div class="hoverinfo">' + JSON.stringify(data) +'</div>';
                },
                borderWidth: '2',
                borderColor: '#FFFFFF',
            }
        });
    }

    onCountryChange(countryName: string) {
        this.cityNames = CityNames.getCites(countryName);
    }

    onCityChange() {
        let coordinates = CityNames.getCityCoordinates(this.cluster.country, this.cluster.city);
        let cityBubble = [{
            name: 'name',
            radius:5,
            yield: 400,
            borderColor: '#4C4C4C',
            latitude: parseFloat(coordinates[0]),
            longitude: parseFloat(coordinates[1])
        }];
        this.map.bubbles(cityBubble);
    }

    onDataCenterChange(dataCenterName: string) {
        if (dataCenterName === 'undefined') {
            this.cluster = new Cluster();
            return;
        }
        for (let cluster of this.clusters) {
            if (cluster.name === dataCenterName) {
                this.cluster = cluster;
                this.onCityChange();
                this.onCountryChange(this.cluster.country);
            }
        }
    }

    onSave() {
        console.log(this.cluster);
        this.clusterService.post(this.cluster).subscribe(message => {
            window.history.back();
        });
    }

    back() {
        window.history.back();
    }
}
