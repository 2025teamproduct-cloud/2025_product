import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";
import SimpleLogo from "./img/simple.png";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-inner">

        <h1 className="navbar-title">
          <Link to="/" className="navbar-home-link">
            <img src={SimpleLogo} alt="logo" className="navbar-logo" />
            近場のグルメ2

          <div className="subTitle">～あなたのランチを楽しいものに～</div>

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
