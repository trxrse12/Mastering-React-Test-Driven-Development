import {Given, When, Then, AfterAll} from '@cucumber/cucumber';
import expect from 'expect'; // use jest in cucumber

// necessary to make cucumber.js exit after
AfterAll(function(){
  setTimeout(function() { process.exit(); }, 1000);
});

Given('the presenter navigated to the application page', {timeout: 60 * 1000}, async function() {
    await this.browseToPageFor('presenter', this.appPage());
});

Given('the presenter clicked the button {string}',
  async function(buttonId){
    await this.getPage('presenter').click(`button#${buttonId}`)
});

Given('the user navigated to the application page',{timeout: 60 * 1000}, async function () {
  await this.browseToPageFor('user', this.appPage());
});

When('the observer navigates to the presenter\'s sharing link', async function(){
  await this.getPage('presenter').waitForSelector('a');
  const link = await this.getPage('presenter').$eval('a', a => a.getAttribute('href'));
  const url = new URL(link);
  await this.browseToPageFor('observer',url);
});

Then('the observer should see a message saying {string}', async function (message){
  const pageText = await this.getPage('observer').$eval(
    'body',
    e => e.outerHTML
  );
  expect(pageText).toContain(message);
});