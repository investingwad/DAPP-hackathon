import React from "react";
import styled from "styled-components";
import "../../global.scss";

export default function Navbar(props) {
  console.log("props--->", props.loggedIn);

  return (
    <div className="Wrapper">
      <div className="Panel">
        {props.loggedIn ? (
          <button className="Button" onClick={props.logout}>
            Logout with Scatter
          </button>
        ) : (
          <button className="Button" onClick={props.login}>
            Login with Scatter
          </button>
        )}
      </div>
    </div>
  );
}
