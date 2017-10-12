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

import {EventEmitter}     from '@angular/core';

export enum DialogType {
  Confirmation, Error, DeleteConfirmation
}
;

export class DialogBox {
  private static dialogType = DialogType;

  private static getCancelButton(type: DialogType): string {
    if (type === DialogType.Confirmation || type === DialogType.DeleteConfirmation) {
      return `<button type="button" class="mdl-button btn-hwx-default">Cancel</button>`;
    }
    return '';
  }

  private static getOKButton(type: DialogType): string {
    if (type === DialogType.DeleteConfirmation) {
      return `<button type="button" class="mdl-button btn-hwx-warning">CONFIRM</button>`;
    }
    return `<button type="button" class="mdl-button btn-hwx-primary">OK</button>`;
  }

  private static createDialogBox(message: string, type: DialogType) {
    let cancelButtonHTML = DialogBox.getCancelButton(type);
    let html = `<dialog id="dialog" class="mdl-dialog dp-dialog">
                    <div class="mdl-dialog__title">${DialogBox.transformTitle(DialogBox.dialogType[type])}</div>
                    <div class="mdl-dialog__content">${message}</div>
                    <div class="mdl-dialog__actions">
                    ${DialogBox.getOKButton(type)}${DialogBox.getCancelButton(type)}</div>
                </dialog>`;

    let element = document.createElement('div');
    element.innerHTML = html;

    document.body.appendChild(element);

    return element;
  }

  private static transformTitle(text) {
    return text.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  public static showConfirmationMessage(message: string, dialogType = DialogType.Confirmation): EventEmitter<boolean> {
    message = message.replace(/\n/g, '<br>');
    let eventEmitter = new EventEmitter<boolean>();
    let element = DialogBox.createDialogBox(message, dialogType);

    try {
      let dialog: any = document.querySelector('#dialog');
      dialog.showModal();

      if (dialogType === DialogType.DeleteConfirmation) {
        dialog.querySelector('.btn-hwx-warning').addEventListener('click', function (e) {
          eventEmitter.emit(true);
          dialog.close();
          dialog.parentElement.removeChild(dialog);
        });
      } else {
        dialog.querySelector('.btn-hwx-primary').addEventListener('click', function (e) {
          eventEmitter.emit(true);
          dialog.close();
          dialog.parentElement.removeChild(dialog);
        });
      }
      dialog.querySelector('.btn-hwx-default').addEventListener('click', function (e) {
        eventEmitter.emit(false);
        dialog.close();
        dialog.parentElement.removeChild(dialog);
      });
    } catch (e) {
    }

    return eventEmitter;
  }

  public static showErrorMessage(message: string, dialogType = DialogType.Error): EventEmitter<boolean> {
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
    } catch (e) {
    }

    return eventEmitter;
  }
}
