import { WebappPage } from './app.po';

describe('webapp App', function() {
  let page: WebappPage;

  beforeEach(() => {
    page = new WebappPage();
  });

  it('should have correct nav title', () => {
    page.navigateTo();
    expect(page.getNavTitle()).toEqual('DATA LIFECYCLE MANAGER');
  });
});
