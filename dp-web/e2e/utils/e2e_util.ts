import { browser, protractor } from 'protractor';

export function waitForElementVisibility (_element ) {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(_element));
}

