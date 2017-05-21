import {Component, Input} from "@angular/core";

import * as moment from 'moment';

@Component({
  selector: 'dp-lakes-list',
  templateUrl: './lakes-list.component.html',
  styleUrls: ['./lakes-list.component.scss'],
})

export class LakesListComponent {
    hoveredIndex;
    _lakes = [];
    _healths = new Map();
    searchTerm:string = '';
    @Input() set lakes(lakes){
        this._lakes = lakes;
    }
    @Input() set healths(healths){
        this._healths = healths;
    }
    get lakesHealth(){
        let lakesHealth = [];
        if(!this._lakes){
            return lakesHealth;
        }
        this._lakes.forEach((lake)=>{
            if(this.searchTerm.length && lake.data.name.toLowerCase().indexOf(this.searchTerm) === -1){
                return;
            }
            if(this._healths.get(lake.data.id)){
              lakesHealth.push({lake:lake, health:this._healths.get(lake.data.id), status: this.getStatus(this._healths.get(lake.data.id))});
            }else {
              lakesHealth.push({lake: lake, health: {}, status: LakeStatus.NA});
            }
        });
        return lakesHealth;
    }

    doGetUptime(since: number) {
        if(!since || since === 0){
            return 'NA';
        }
        return moment.duration(since).humanize();
    }

    private getStatus(health){
        if(health && health.status && health.status.state === 'STARTED'){
            return LakeStatus.UP;
        }else if(health && health.status && health.status.state === 'NOT STARTED'){
            return LakeStatus.DOWN;
        }else{
            return LakeStatus.NA;
        }
    }
    private isUp(status){
        return status === LakeStatus.UP;
    }
    private isDown(status){
         return status === LakeStatus.DOWN;
    }
    private isNotAvailable(status){
         return status === LakeStatus.NA;
    }

    filter(event){
        let term = event.target.value.trim();
        this.searchTerm = term;
    }
}


export enum LakeStatus {
    UP,
    DOWN,
    NA
}
