import { DssWebPage } from './app.po';

describe('dss-web App', () => {
  let page: DssWebPage;

  beforeEach(() => {
    page = new DssWebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
