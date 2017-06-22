import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SessionStorageService } from 'services/session-storage.service';

@Injectable()
export class FormService {
  private formNamespace = 'sync_forms';

  constructor(private sessionStorage: SessionStorageService) { }

  persistForm(formId: string, values: any) {
    this.sessionStorage.set(this.formNamespace, {[formId]: values});
  }

  retrieveForm(formId: string): any {
    return this.sessionStorage.get(this.formNamespace)[formId];
  }

  retrieveForms(): Object {
    return this.sessionStorage.get(this.formNamespace) || {};
  }

  resetForm(formId: string) {
    const formNamespaceValue = this.sessionStorage.get(this.formNamespace);
    if (formNamespaceValue[formId]) {
      delete formNamespaceValue[formId];
      this.sessionStorage.set(this.formNamespace, formNamespaceValue);
    }
  }
}
