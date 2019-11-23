import React, { Component } from "react";

import { NavLink } from "react-router-dom";

import "./coin.css";

class Coin extends Component {
  handleClick = () => {
    return console.log("Button Clicked");
  };

  render() {
    const { coinDetails } = this.props;

    return (
      <div className="coin">
        <div className="coin-name">{coinDetails.name}</div>
        <div className="coin-balance-text">{coinDetails.balanceText}</div>
        <div className="coin-price-info">
          <button className="send_receive_button">Send</button>
          <button className="send_receive_button">Receive</button>
          <NavLink
            to={{
              pathname: "/leaseService",
              state: { coinDetails }
            }}
          >
            {coinDetails.possibleToLease ? (
              <button className="lease_button">Lease</button>
            ) : null}
          </NavLink>
        </div>
      </div>
    );
  }
}

export default Coin;
