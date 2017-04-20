import {Observable} from 'rxjs/Rx';
import {TranslateLoader} from '@ngx-translate/core';

export class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return Observable.of({});
  }
}
