import { FormGroup, FormControl } from '@angular/forms';

export const markAllTouched = (form: FormGroup) => {
  if (!form.controls) {
    return;
  }
  Object.keys(form.controls).forEach(controlName => {
    const control = form.controls[controlName];
    control.markAsTouched({ onlySelf: false });
    markAllTouched(<FormGroup>control);
  });
};
