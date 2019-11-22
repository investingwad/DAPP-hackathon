import React, { Component } from "react";
import Coin from "./Coin";

import "./portfolio_list.css";

class PortfolioList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      portfolioList: [
        {
          name: "BTC Wallet",
          balanceText: "0.0000 BTC ≈ $0",
          balance: 0.0,
          possibleToLease: false
        },
        {
          name: "ETH Wallet",
          balanceText: "0.0000 ETH ≈ $0",
          balance: 0.0,
          possibleToLease: false
        },
        {
          name: "EOS Wallet",
          balanceText: "1000.0000 EOS ≈ $3140",
          balance: 1000.0,
          possibleToLease: true
        },
        {
          name: "ETC Wallet",
          balanceText: "0.0000 ETC ≈ $0",
          balance: 0.0,
          possibleToLease: false
        },
        {
          name: "LTC Wallet",
          balanceText: "0.0000 LTC ≈ $0",
          balance: 0.0,
          possibleToLease: false
        },
        {
          name: "ZRX Wallet",
          balanceText: "0.0000 ZRX ≈ $0",
          balance: 0.0,
          possibleToLease: false
        }
      ]
    };
  }

  render() {
    return (
      <div className="app">
        <div className="porfolio_balance_div">
          <h6 className="porfolio_balance_text">Porfolio Balance</h6>
          <h5 className="balance_text">$3140</h5>
        </div>
        <div className="portfolioList">
          {this.state.portfolioList.map(portfolioList => (
            <Coin key={portfolioList.name} coinDetails={portfolioList} />
          ))}
        </div>
      </div>
    );
  }
}

export default PortfolioList;
