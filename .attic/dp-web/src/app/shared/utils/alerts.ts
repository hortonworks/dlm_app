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