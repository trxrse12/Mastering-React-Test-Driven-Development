import {app} from '../../server/src/app'; // import the express app
import {setWorldConstructor} from "@cucumber/cucumber";

class World {
  constructor() {
    this.pages = {};
  }

  setPage(name, page){
    this.pages[name] = page;
  }

  getPage(name){
    return this.pages[name];
  }

  startServer () {
    const port = process.env.PORT || 3000;
    this.server = app.listen(port);
  }

  closeServer() {
    Object.keys(this.pages).forEach(name =>
      this.pages[name].browser().close()
    );
    this.server.close();
  }

}

setWorldConstructor(World);