import {EventEmitter}     from '@angular/core';

export enum DialogType {
  Confirmation, Error
};

export class DialogBox {
  private static dialogType = DialogType;

  private static getCancelButton(type: DialogType): string {
    if (type === DialogType.Confirmation) {
      return `<button type="button" class="mdl-button btn-hwx-secondary">Cancel</button>`;
    }

    return '';
  }

  private static createDialogBox(message: string, type: DialogType) {
    let cancelButtonHTML = DialogBox.getCancelButton(type);
    let html = `<dialog id="dialog" class="mdl-dialog">
                    <div class="hwx-title">`+ DialogBox.dialogType[type] + `</div>
                    <div class="spacer-15"> </div>
                    <div class="hwx-desc">` + message +` </div>
                    <div class="mdl-dialog__actions">
                      <button type="button" class="mdl-button btn-hwx-primary">OK</button>` 
                      + DialogBox.getCancelButton(type) +
                    `</div>
                </dialog>`;

    let element = document.createElement('div');
    element.innerHTML = html;

    document.body.appendChild(element);

    return element;
  }

  public static showConfirmationMessage(message: string, dialogType = DialogType.Confirmation): EventEmitter<boolean> {
    message = message.replace(/\n/g, '<br>');
    let eventEmitter = new EventEmitter<boolean>();
    let element = DialogBox.createDialogBox(message, dialogType);

    try {
      let dialog: any = document.querySelector('#dialog');
      dialog.showModal();

      dialog.querySelector('.btn-hwx-primary').addEventListener('click', function (e) {
        eventEmitter.emit(true);
        dialog.close();
        dialog.parentElement.removeChild(dialog);
      });

      dialog.querySelector('.btn-hwx-secondary').addEventListener('click', function (e) {
        eventEmitter.emit(false);
        dialog.close();
        dialog.parentElement.removeChild(dialog);
      });
    } catch (e) {}

    return eventEmitter;
  }
}
