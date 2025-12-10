import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";
import SimpleLogo from "./img/Simple.png";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-inner">

        <h1 className="navbar-title">
          <Link to="/" className="navbar-home-link">
            <img src={SimpleLogo} alt="logo" className="navbar-logo" />
          </Link>
        </h1>

        <div className="navbar-link">
          <Link to="/mypage">マイページへ</Link>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
