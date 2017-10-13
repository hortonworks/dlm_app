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

import {EventEmitter} from '@angular/core';
import * as DialogPolyfill from 'dialog-polyfill';


export enum DialogType {
  Confirmation, Error, DeleteConfirmation
}

export class DialogBox {

  private static getCancelButton(text: String): string {
    if (text && text.length) {
      return `<button type="button" class="mdl-button btn-hwx-default">${text}</button>`;
    }
    return '';
  }

  private static getOKButton(text: String, type: DialogType): string {
    if (type === DialogType.DeleteConfirmation) {
      return `<button type="button" class="mdl-button btn-hwx-warning">${text}</button>`;
    }
    return `<button type="button" class="mdl-button btn-hwx-primary">${text}</button>`;
  }

  private static createDialogBox(message: string, okButtonText, cancelButtonText, title, type: DialogType) {
    let html = `
                    <div class="mdl-dialog__title">${title}</div>
                    <div class="mdl-dialog__content">${message}</div>
                    <div class="mdl-dialog__actions">
                    ${DialogBox.getOKButton(okButtonText, type)}${DialogBox.getCancelButton(cancelButtonText)}</div>
               `;
    let dialogElement = document.createElement('dialog');
    dialogElement.id = 'dialog';
    dialogElement.className += 'mdl-dialog dp-dialog';
    dialogElement.innerHTML = html;
    DialogPolyfill.registerDialog(dialogElement);
    document.body.appendChild(dialogElement);
    return dialogElement;
  }

  public static showConfirmationMessage(title: string, message: string, okButtonText: string, cancelButtonText: string, dialogType = DialogType.Confirmation): EventEmitter<boolean> {
    message = message.replace(/\n/g, '<br>');
    let eventEmitter = new EventEmitter<boolean>();
    let dialog: any = DialogBox.createDialogBox(message, okButtonText, cancelButtonText, title, dialogType);
    try {
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

  public static showErrorMessage(title: string, message: string, okButtonText: string, dialogType = DialogType.Error): EventEmitter<boolean> {
    message = message.replace(/\n/g, '<br>');
    let eventEmitter = new EventEmitter<boolean>();
    let dialog: any = DialogBox.createDialogBox(message, okButtonText, null, title, dialogType);
    try {
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

