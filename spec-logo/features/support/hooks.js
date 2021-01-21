import {Before, After} from '@cucumber/cucumber';

Before(function() {
  this.startServer();
});

After(function () {
  this.closeServer();
});