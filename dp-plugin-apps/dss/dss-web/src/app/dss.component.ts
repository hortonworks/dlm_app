import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

declare var require;

@Component({
  selector: 'dss-root',
  templateUrl: './dss.component.html',
  styleUrls: ['./dss.component.scss']
})
export class AppComponent implements OnInit {

  title = 'app works!';

  constructor(
      private translateService: TranslateService) {

    translateService.setTranslation('en', require('../assets/i18n/en.json'));
    translateService.setDefaultLang('en');
    translateService.use('en');
  }

  ngOnInit(): void {

  }
}
