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

export class StringUtils {
  public static trunc(str: string, n: number) {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
  };

  public static cleanupUri(url: string): string {
    if (!url || url.length === 0) {
      return '';
    }
    url = url.replace(/^\s+|\s+$/g, '');
    url = url.replace(/\/$/, '');

    let protoHostArray = url.split("://");
    if(protoHostArray.length < 2 || !(protoHostArray[0] === "http" || protoHostArray[0] === "https")){
      return '';
    }
    let lastColIdx = protoHostArray[1].lastIndexOf(":");
    if(lastColIdx === -1){
      return '';
    }
    let urlHostInfo = protoHostArray[1].substring(0,lastColIdx);
    let urlPortInfo = protoHostArray[1].substring((lastColIdx+1));


    let link = document.createElement('a');

    link.setAttribute('href', url);
    if(urlHostInfo !== link.hostname || urlPortInfo !== link.port){
      return '';
    }

    const cleanedUri = `${link.protocol || 'http:'}//${link.hostname}:${link.port || '80'}`;
    // cleanup for garbage collection
    // prevent leaks
    link = null;
    return cleanedUri;
  }

  public static humanizeBytes(bytes: number): string {
    if (bytes == 0) {
      return '0 Bytes';
    }
    let sizes = Array('Bytes ', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB' , 'ZB', 'YB')
    let k = 1024;
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
  }
  public static getFlattenedObjects(obj: any): string {
    let objArray = Object.keys(obj).map((key) => {
      if (!obj[key]) {
        return;
      }
      if (!Array.isArray(obj[key]) && typeof obj[key] !== 'object') {
        return `${key}: ${obj[key]}`;
      } else if (Array.isArray(obj[key])) {
        return `${key}: ${obj[key].join()}`;
      } else {
        return this.getFlattenedObjects(obj[key]);
      }
    });
    return objArray.join(', ');
  }
}
