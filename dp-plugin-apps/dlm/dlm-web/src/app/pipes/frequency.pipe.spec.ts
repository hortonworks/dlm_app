import { FrequencyPipe } from './frequency.pipe';
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, Http } from '@angular/http';

export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http);
}

describe('FrequencyPipe', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        BrowserModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [Http]
          }
        })
      ],
      declarations: [FrequencyPipe]
    });
    this.translateService = getTestBed().get(TranslateService);
    this.translateService.setDefaultLang('en');
    this.translateService.use('en');
    this.pipe = new FrequencyPipe(this.translateService);
  }));

  describe('#transform', () => {
    [
      {input: 60, output: 'Every 1m'},
      {input: 60 * 2, output: 'Every 2m'},
      {input: 3600, output: 'Every 1h'},
      {input: 3600 * 2, output: 'Every 2h'},
      {input: 3600 * 24, output: 'Every 1d'},
      {input: 3600 * 24 * 2, output: 'Every 2d'},
      {input: 3600 * 24 * 7, output: 'Every 1w'},
      {input: 3600 * 24 * 7 * 2, output: 'Every 2w'}
    ].forEach(test => {
      it(`${test.input} -> ${test.output}`, () => {
        expect(this.pipe.transform(test.input)).toBe(test.output);
      });
    });
  });

});
