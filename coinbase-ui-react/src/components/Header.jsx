import React, { Component } from "react";

import { Navbar, Nav, Button } from "react-bootstrap";

// import { NavLink } from "react-router-dom";

import logo from "../coinbase_logo.png";

// Styling the header.
var style = {
  backgroundColor: "#FFF",
  marginTop: "12px",
  marginBottom: "1px",
  marginRight: "50px"
};

class Header extends Component {
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
          Home
        </Nav.Link>

        <Nav.Link
          className="margin_r_l_5"
          href="#"
          target="_blank"
          style={{ color: "black", textDecoration: "none", fontWeight: "bold" }}
        >
          Price
        </Nav.Link>

        <Nav.Link
          className="margin_r_l_5"
          href="#"
          target="_blank"
          style={{ color: "black", textDecoration: "none", fontWeight: "bold" }}
        >
          Accounts
        </Nav.Link>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className=" mr-auto" />
          <Nav inline>
            <Button
              className="margin_r_l_15"
              variant="primary"
              onClick={() => {}}
            >
              Trade
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Header;
