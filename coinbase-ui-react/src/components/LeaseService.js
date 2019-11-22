import React, { Component } from "react";

import LeaseHeader from "./LeaseHeader";
import LeaseEos from "./LeaseEos";

import "./leaseservice.css";

class LeaseService extends Component {
  render() {
    return (
      <div className="LeaseService">
        <LeaseHeader />
        <hr
          style={{
            color: "#f2f2f2",
            backgroundColor: "##f2f2f2",
            height: 0.5,
            borderColor: "#f2f2f2",
            borderRadius: "1px"
          }}
        />
        <div className="checkout-page">
          <LeaseEos coinDetails={this.props.coinDetails} />
        </div>
      </div>
    );
  }
}

export default LeaseService;
