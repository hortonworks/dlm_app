/**
 * Created by rksv on 22/11/16.
 */
import {Component, AfterViewInit, OnInit, ViewChild, ElementRef} from '@angular/core';
import {CityNames} from '../../common/utils/city-names';
import {AmbariService} from '../../services/ambari.service';
import {Ambari} from '../../models/ambari';
import {DataCenter} from '../../models/data-center';
import {DataCenterService} from '../../services/data-center.service';

declare var Datamap:any;

@Component({
    selector: 'add-cluster' ,
    styleUrls: ['assets/app/components/add-cluster/add-cluster.component.css'],
    templateUrl: 'assets/app/components/add-cluster/add-cluster.component.html'
})

export class AddClusterComponent implements AfterViewInit, OnInit {

    map: any;
    ambaris: Ambari[] = [];
    cityNames: string[] = [];
    clusterIPOrURL: string = '';
    isNewAmbari: boolean = true;
    ambari: Ambari = new Ambari();
    dataCenters: DataCenter[] = [];
    ambarisInDatacenter: Ambari[] = [];
    dataCenter: DataCenter = new DataCenter();
    countryNames = Datamap.prototype.worldTopo.objects.world.geometries;

    @ViewChild('selectCity') selectCity: ElementRef;

    constructor(private ambariService: AmbariService, private dataCenterService: DataCenterService) {}

    ngOnInit() {
        this.dataCenterService.get().subscribe((dataCenters: DataCenter[]) => {
            this.dataCenters = dataCenters;
        });
        this.ambariService.get().subscribe((ambaris: Ambari[]) => {
            this.ambaris = ambaris;
        });
    }

    ngAfterViewInit() {
        this.map = new Datamap({element: document.getElementById('map'),projection: 'mercator',
            fills: {
                defaultFill: '#E5E5E5'
            },
            bubblesConfig: {
                popupTemplate: function(geography: any, data: any) {
                    return '<div class="hoverinfo">' + data.location +'</div>';
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
        let coordinates = CityNames.getCityCoordinates(this.dataCenter.location.country, this.dataCenter.location.place);
        let cityBubble = [{
            name: 'name',
            radius:5,
            yield: 400,
            borderColor: '#4C4C4C',
            location: this.dataCenter.location.place + ' - ' + this.dataCenter.location.country,
            latitude: parseFloat(coordinates[0]),
            longitude: parseFloat(coordinates[1])
        }];
        this.map.bubbles(cityBubble);
    }

    onDataCenterChange(dataCenterName: string) {
        if (dataCenterName === 'new') {
            this.ambari = new Ambari();
            this.isNewAmbari = true;
            this.dataCenter = new DataCenter();
            return;
        }

        this.ambarisInDatacenter = [];
        for (let ambari of this.ambaris) {
            if (ambari.dataCenter === dataCenterName) {
                this.ambarisInDatacenter.push(ambari);
            }
        }
        let dataCenterByName = this.getDataCenterByName(dataCenterName);
        if (dataCenterByName !== null) {
            this.dataCenter = dataCenterByName;
            this.onCityChange();
            this.onCountryChange(this.dataCenter.location.country);
        }
    }

    onAmbariSelect(ambariHost: string) {
        this.ambari = new Ambari();
        if (ambariHost === 'new') {
            this.isNewAmbari = true;
        }
        for (let ambari of this.ambarisInDatacenter) {
            if (ambari.host === ambariHost) {
                this.ambari = ambari;
                this.isNewAmbari = false;
                break;
            }
        }
    }

    onDataCenterNameChange() {
        let dataCenterByName = this.getDataCenterByName(this.dataCenter.name);
        if (dataCenterByName !== null) {
            this.onDataCenterChange(this.dataCenter.name);
            this.dataCenter = dataCenterByName;
        }
    }

    getDataCenterByName(dataCenterName: string): DataCenter {
        for (let dataCenter of this.dataCenters) {
            if (dataCenter.name.toLocaleLowerCase() === dataCenterName.toLocaleLowerCase()) {
                return dataCenter;
            }
        }

        return null;
    }

    getLocation() {
        let tmpAnchor = document.createElement('a');
        tmpAnchor.href = this.clusterIPOrURL;
        return tmpAnchor;
    };

    onSave() {
        console.log(this.ambari);
        if (this.isNewAmbari) {
            let locationAnchor = this.getLocation();
            this.ambari.host = locationAnchor.hostname;
            this.ambari.port = parseInt(locationAnchor.port);
            this.ambari.protocol = locationAnchor.protocol.replace(':','');
            this.ambari.dataCenter = this.dataCenter.name;
        }

        if (this.getDataCenterByName(this.dataCenter.name) === null) {
            this.dataCenterService.put(this.dataCenter).subscribe(message => {
                this.ambariService.post(this.ambari).subscribe(message => {
                    window.history.back();
                });
            });
        } else {
            if (this.isNewAmbari) {
                this.ambariService.post(this.ambari).subscribe(message => {
                    window.history.back();
                });
            } else {
                this.ambariService.put(this.ambari).subscribe(message => {
                    window.history.back();
                });
            }

        }
    }

    back() {
        window.history.back();
    }
}
