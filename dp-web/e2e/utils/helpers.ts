import {browser, $$, ElementFinder} from 'protractor';
import * as shell from 'shelljs';
import { db } from '../data';

const TIMEOUT = 1000;
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 1024;

async function safeGet(url: string) {
  browser.ignoreSynchronization = true;
  await browser.get(url);
  await maximizeWindow();
};

async function  maximizeWindow(width: number = DEFAULT_WIDTH, height: number = DEFAULT_HEIGHT) {
  await browser.driver.manage().window().setSize(width, height);
  // does not work on mac os
  // await browser.driver.manage().window().maximize();
}

async function waitForElement(element: ElementFinder, timeout: number = TIMEOUT) {
	return browser.wait(async function () {
    const isPresent = await element.isPresent()
    if (isPresent) {
      return element.isDisplayed();
    }
    else {
      return false;
    }
	}, timeout, `Wait for ${element.locator()} timed out.`);
}

async function waitForUrl(url: string, timeout: number = TIMEOUT){
  return browser.wait(async function () {
    return browser.getCurrentUrl().then(function (currentUrl) {
      return currentUrl.endsWith(url);
    })
  }, timeout);
}

async function urlChanged(url: string){
  return browser.getCurrentUrl().then(function (currentUrl) {
    return currentUrl.endsWith(url);
  })
}

async function expectEqualText(element: ElementFinder, targetText:string, loggoingMode:boolean = false){
  await element.getText().then(await function (text) {
    (loggoingMode && console.log(refinedText(text)));
    expect(text).toEqual(targetText);
  })
}

function refinedText(text:string){
  if(!(text.trim())){
    return "Empty text";
  }
  return text;
}

async function cleanup() {
    browser.executeScript('window.sessionStorage.clear();');
    browser.executeScript('window.localStorage.clear();');
    browser.manage().deleteAllCookies();
}

async function dbReset() {
  shell.pushd(db.path);
  shell.exec(db.cmd);
  shell.popd();
}

async function suspend() {
  await new Promise((resolve, reject) => {});
}

export const helper = {
  safeGet,
  maximizeWindow,
  waitForElement,
  cleanup,
  dbReset,
  suspend,
  waitForUrl,
  urlChanged,
  expectEqualText
};
