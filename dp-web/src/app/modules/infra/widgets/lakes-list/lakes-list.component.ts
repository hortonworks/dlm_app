import {Component, Input, OnInit} from "@angular/core";

import * as moment from 'moment';

@Component({
  selector: 'dp-lakes-list',
  templateUrl: './lakes-list.component.html',
  styleUrls: ['./lakes-list.component.scss'],
})

export class LakesListComponent implements OnInit {
    hoveredIndex;
    _lakes = [];
    _healths = [];
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
        this._lakes.forEach((lake, index)=>{
            if(index < this._healths.length){
                lakesHealth.push({lake:lake, health:this._healths[index], status: this.getStatus(this._healths[index])})
            }else{
                lakesHealth.push({lake:lake, health:{}, status:LakeStatus.NA})
            }
        })
        return lakesHealth;
    }
            
    doGetUptime(since: number) {
        if(since === 0){
            return 'NA';
        }
        return moment.duration(since).humanize();
    }
    ngOnInit(){
    
    }
    private getStatus(health){
        console.log(health);
        if(health && health.status && health.status.state === 'STARTED'){
            console.log('up')
            return LakeStatus.UP;
        }else if(health && health.status && health.status.state === 'NOT STARTED'){
            return LakeStatus.DOWN;
        }else{
            return LakeStatus.NA;
        }
    }
    isUp(status){
        console.log(status)
        return status === LakeStatus.UP;
    }
    private isDown(status){
         return status === LakeStatus.DOWN;
    }
    private isNotAvailable(status){
         return status === LakeStatus.NA;
    }
}


export enum LakeStatus {
    UP,
    DOWN,
    NA
}
