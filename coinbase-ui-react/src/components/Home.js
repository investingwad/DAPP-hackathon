import React, { Component } from "react";
import "../Home.css";

import Header from "./Header";
import PortfolioList from "./PortfolioList";

class Home extends Component {
  constructor() {
    super();
    this.state = {
      showPopup: false
    };
  }

  togglePopup = () => {
    this.setState({
      showPopup: !this.state.showPopup
    });
  };

  componentDidMount() {
    this.togglePopup();
  }

  render() {
    return (
      <div className="Home">
        <Header />
        <hr
          style={{
            color: "#f2f2f2",
            backgroundColor: "##f2f2f2",
            height: 0.5,
            borderColor: "#f2f2f2",
            borderRadius: "1px"
          }}
        />
        <PortfolioList />
      </div>
    );
  }
}

export default Home;
