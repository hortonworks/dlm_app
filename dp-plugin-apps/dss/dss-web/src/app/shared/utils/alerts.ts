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

export class Alerts {
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
}
