import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import Home from "./components/Home";
import LeaseService from "./components/LeaseService";
import Error from "./components/Error";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" component={Home} exact />
          <Route path="/leaseservice" component={LeaseService} exact />
          <Route component={Error} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
