import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LakeService } from '../../services/lake.service';

@Component({
  selector: 'dp-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss']
})
export class EntryComponent implements OnInit {

  constructor(private router: Router, private lakeService: LakeService) { }

  ngOnInit() {

    this.lakeService
      .list()
      .subscribe(lakes => lakes.length === 0 && this.router.navigate(['/onboard']));


  }

}
