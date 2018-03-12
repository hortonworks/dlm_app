/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Component, OnInit, ViewChild} from '@angular/core';
import {SettingsService} from "../../../../services/settings.service";

@Component({
  selector: 'dp-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  certs: any[] = [];
  showingUpload = false;
  selectedFile: String;
  allSelected = false;
  uploading = false;
  uploadSuccess = false;
  uploadFailure = false;

  constructor(private settingsService: SettingsService) { }

  ngOnInit() {
   this.listCerts()
  }

  listCerts(){
    this.settingsService.listCerts().subscribe(certs => {
      certs.forEach(cert => {
        cert.selected = !!this.certs.find(c => c.id === cert.id && c.selected)
      });
      this.certs = certs;
    });
  }

  @ViewChild('fileInput') fileInput;
  name: string;

  fileChanged(files){
    this.selectedFile = files[0].name;
  }

  selectAll(){
    this.certs.forEach(cert => {
      cert.selected = this.allSelected;
    });
  }

  upload(): void {
    this.uploading = true;
    let file = this.fileInput.nativeElement.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (data) => {
      let result = reader.result;
      this.settingsService.uploadCert(this.name, "PEM", result).subscribe(response =>{
        this.listCerts();
        this.clearForm();
        this.uploadSuccess = true;
        this.uploadFailure = false;
      },(error)=>{
        console.error(error)
        this.uploadSuccess = false;
        this.uploadFailure = true;
      })
    };
    reader.onerror = function () {
      console.error("Unable to read file")
    };
  }

  showUpload(){
    this.showingUpload = true;
  }

  hideUpload(){
    this.showingUpload = false;
    this.clearForm();
  }

  deleteCert(){
    this.certs.forEach(cert => {
      if(cert.selected){
        this.settingsService.deleteCert(cert.id).subscribe(response => {
          this.listCerts();
        });
      }
    });
  }

  clearForm(){
    this.selectedFile = '';
    this.name = '';
    this.uploading = false
  }

}
