export class StringUtils {
  public static trunc(str: string, n: number) {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
  };

  public static cleanupUri(url: string): string {
    // http://stackoverflow.com/a/26434126/640012
    //  create an anchor element (note: no need to append this element to the document)
    if (!url || url.length === 0) {
      return '';
    }
    url = url.replace(/\/$/, '');
    let link = document.createElement('a');
    //  set href to any path
    link.setAttribute('href', url);

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
