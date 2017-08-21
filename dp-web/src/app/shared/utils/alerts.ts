import {el} from '@angular/platform-browser/testing/src/browser_util';
export class Alerts {

  private errorHtml: string =
    `<div class="error-notification-bar">
      <i class="fa fa-times-circle pull-left"></i>
      <div class="text-medium">{{"common.unauthorized" | translate}}</div>
      <div class="text-small-1 inline">{{"common.invalidUser" | translate}}</div>
      <div class="text-small-1 inline pull-right"><a href="{{signOutUrl}}">{{"common.signout" | translate}}</a></div>
    </div>`;
  private successHtml: string =
    `<div class="success-notification-bar">
      <i class="fa fa-check-circle pull-left"></i>
      <div class="text-medium">{{"common.unauthorized" | translate}}</div>
      <div class="text-small-1 inline">{{"common.invalidUser" | translate}}</div>
      <div class="text-small-1 inline pull-right"><a href="{{signOutUrl}}">{{"common.signout" | translate}}</a></div>
    </div>`;

  public static showErrorMessage(message: string): void {
    let data = {message: message, timeout: 5000};
    let ele: any = document.querySelector('#data-plane-snackbar');
    ele.querySelector('.mdl-snackbar__text').className = 'mdl-snackbar__text mdl-color-text--red';
    ele.MaterialSnackbar.showSnackbar(data);
  }

  public static showSuccessMessage(message: string): void {
    let data = {message: message};
    let ele: any = document.querySelector('#data-plane-snackbar');
    ele.querySelector('.mdl-snackbar__text').className = 'mdl-snackbar__text';
    ele.MaterialSnackbar.showSnackbar(data);
  }

  public static showError(title, message, container?): void {
    let html: string =
      `<i class="fa fa-times-circle-o pull-left icon error"></i>
       <div class="title error">${title}</div>
       <div class="">${message}</div>`;

    let parentElement: any = container && document.querySelector(`#${container}`) ?
      document.querySelector(`#${container}`) : document.querySelector('#page-content');
    let element: any = document.createElement('div');

    if (!container) {
      element.style.marginTop = '15px';
      element.style.marginRight = '24px';
      element.style.marginRight = '24px';
    }
    element.className = 'notification-bar';
    element.innerHTML = html;

    parentElement.insertBefore(element, parentElement.firstChild);
    window.scrollTo(0, 0);
  }

  public static hideError(){
    
  }

  public static showSuccess(title, message, container?): void {
    let html: string =
      `<i class="fa fa-check-circle-o pull-left icon success"></i>
        <div class="title success">${title}</div>
        <div class="">${message}</div>`;
    let parentElement: any = container && document.querySelector(`#${container}`) ?
      document.querySelector(`#${container}`) : document.querySelector('#page-content');
    let element: any = document.createElement('div');
    element.className = 'notification-bar';
    element.innerHTML = html;
    parentElement.insertBefore(element, parentElement.firstChild);
    window.scrollTo(0, 0);
  }
}
