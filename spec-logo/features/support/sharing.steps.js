import {Given, When, Then, AfterAll} from '@cucumber/cucumber';
import puppeteer from 'puppeteer';
import expect from 'expect'; // use jest in cucumber

const port = process.env.port || 3000;
const appPage = `http://localhost:${port}/index.html`;

// necessary to make cucumber.js exit after
AfterAll(function(){
  setTimeout(function() { process.exit(); }, 1000);
});

Given('the presenter navigated to the application page', {timeout: 60 * 1000}, async function() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(appPage);
  this.setPage('presenter', page);
});

Given('the presenter clicked the button {string}',
  async function(buttonId){
    await this.getPage('presenter').click(`button#${buttonId}`)
});

When('the observer navigates to the presenter\'s sharing link', async function(){
  await this.getPage('presenter').waitForSelector('a');
  const link = await this.getPage('presenter').$eval('a', a => a.getAttribute('href'));
  const url = new URL(link);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  this.setPage('observer', page);
});

Then('the observer should see a message saying {string}', async function (message){
  const pageText = await this.getPage('observer').$eval(
    'body',
    e => e.outerHTML
  );
  expect(pageText).toContain(message);
});