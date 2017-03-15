import {Component, AfterViewInit, OnInit, ViewChild, ElementRef} from '@angular/core';
import {CityNames} from '../../shared/utils/city-names';
import {AmbariService} from '../../services/ambari.service';
import {Ambari} from '../../models/ambari';
import {DataCenter} from '../../models/data-center';
import {DataCenterService} from '../../services/data-center.service';
import {Alerts} from '../../shared/utils/alerts';
import {Environment} from '../../environment';
import 'd3';

declare var Datamap:any;

@Component({
    selector: 'add-cluster' ,
    styleUrls: ['./add-cluster.component.scss'],
    templateUrl: './add-cluster.component.html'
})

export class AddClusterComponent implements AfterViewInit, OnInit {

    map: any;
    ambaris: Ambari[] = [];
    selectedAmbariHost: string = '';
    cityNames: string[] = [];
    clusterIPOrURL: string = '';
    isNewAmbari: boolean = true;
    ambari: Ambari = new Ambari();
    dataCenters: DataCenter[] = [];
    ambarisInDatacenter: Ambari[] = [];
    dataCenter: DataCenter = new DataCenter();
    countryNames = Datamap.prototype.worldTopo.objects.world.geometries;

    @ViewChild('selectCity') selectCity: ElementRef;
    @ViewChild('ambariSelected') ambariSelected: ElementRef;

    welcomeText = `Add a cluster to the Data Plane by filling in the details below. Once a cluster is added,
    Data Plane will fetch all the details from the cluster and would allow you monitor/manage them from this interface`;
    dataCenterHelp1 = `Add a new datacenter or select an existing datacenter to see all the clusters present in the datacenter.`;
    dataCenterHelp2 = '';
    ambariHelp= `Login credentials for ambari the credentials are used tio fetch data from ambari`;
    kerbarosHelp = `Kerberos principle and key URL are used to fetch data securely from ambari and the services configured on ambari`;

    constructor(private ambariService: AmbariService, private dataCenterService: DataCenterService, private environment: Environment) {
        this.dataCenterHelp2 = this.environment.DATA_CENTER_DATA_LAKE + ` groups the cluster's based on the location they are present. The grouping would help administrators to
            look at all the clusters present in a datacenter in a single view`;
    }

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

        let dataCenterByName = this.getDataCenterByName(dataCenterName);
        if (dataCenterByName !== null) {
            this.dataCenter = dataCenterByName;
            this.onCityChange();
            this.onCountryChange(this.dataCenter.location.country);
        }

        this.ambarisInDatacenter = [];
        for (let ambari of this.ambaris) {
            if (ambari.dataCenter === dataCenterName) {
                this.ambarisInDatacenter.push(ambari);
            }
        }

        if (this.ambarisInDatacenter.length > 0) {
            let ambari = this.ambarisInDatacenter[0];
            this.selectedAmbariHost = ambari.host;
            this.onAmbariSelect(this.selectedAmbariHost);
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
    }

    getAmbariHostName(ambari: Ambari) {
        return ambari.protocol + '://' + ambari.host + ':' + ambari.port;
    }

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
                Alerts.showSuccessMessage('Saved '+ this.environment.DATA_CENTER_DATA_LAKE+' configuration');
                this.ambariService.post(this.ambari).subscribe(message => {
                    Alerts.showSuccessMessage('Saved cluster configuration');
                    window.history.back();
                });
            });
        } else {
            if (this.isNewAmbari) {
                this.ambariService.post(this.ambari).subscribe(message => {
                    Alerts.showSuccessMessage('Saved cluster configuration');
                    window.history.back();
                });
            } else {
                this.ambariService.put(this.ambari).subscribe(message => {
                    Alerts.showSuccessMessage('Saved cluster configuration');
                    window.history.back();
                });
            }

        }
    }

    back() {
        window.history.back();
    }
}
