import React, { Component } from "react";

import { Navbar, Nav } from "react-bootstrap";

import logo from "../coinbase_logo.png";

// Styling the header.
var style = {
  backgroundColor: "#FFF",
  marginTop: "12px",
  marginBottom: "1px",
  marginRight: "50px"
};

class LeaseHeader extends Component {
  render() {
    return (
      <Navbar expand="lg" style={style}>
        <Navbar.Brand variant="primary">
          <img
            alt="coinbase-logo"
            src={logo}
            style={{ width: 100, marginTop: -7, marginRight: 45 }}
          />
        </Navbar.Brand>

        <Nav.Link
          className="margin_r_l_55"
          href="#"
          target="_blank"
          style={{ color: "black", textDecoration: "none", fontWeight: "bold" }}
        >
          How it works
        </Nav.Link>
      </Navbar>
    );
  }
}

export default LeaseHeader;
