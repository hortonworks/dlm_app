import { Component, OnInit } from '@angular/core';
import { DropdownItem } from '../../../components/dropdown/dropdown-item';

@Component({
  selector: 'dp-cluster-search',
  templateUrl: './cluster-search.component.html',
  styleUrls: ['./cluster-search.component.scss']
})
export class ClusterSearchComponent implements OnInit {

  addOptions = <[DropdownItem]>[
    {
      label: 'Cluster'
    },
    {
      label: 'Policy'
    }
  ];

  sortOptions = <[DropdownItem]>[
    {
      label: 'Registered'
    }
  ]

  constructor() { }

  handleSelectedAdd(option: DropdownItem) {
    console.debug('add', option);
  }

  handleSelectedSort(option: DropdownItem) {
    console.debug('sort by', option);
  }

  ngOnInit() {
  }

}
