import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { FormService } from 'services/form.service';
import { ActionTypes as formActions, saveFormValue } from 'actions/form.action';
import { ActionTypes as appActions, noop } from 'actions/app.action';

@Injectable()
export class FormEffects {

  @Effect() loadFormFromSession$: Observable<any> = this.actions$
    .ofType(appActions.INIT_APP)
    .switchMap(() => {
      const storedForms = this.form.retrieveForms();
      return Object.keys(storedForms).map(formId => saveFormValue(formId, storedForms[formId]));
    });

  @Effect() saveForm$: Observable<any> = this.actions$
    .ofType(formActions.SAVE_FORM_VALUE)
    .map(toPayload)
    .switchMap(payload => {
      const { values, formId } = payload;
      this.form.persistForm(formId, values);
      return Observable.of(noop());
    });

  @Effect() resetForm$: Observable<any> = this.actions$
    .ofType(formActions.RESET_FORM_VALUE)
    .map(toPayload)
    .switchMap(payload => {
      this.form.resetForm(payload.formId);
      return Observable.of(noop());
    });


  constructor(private actions$: Actions, private form: FormService) { }
}
