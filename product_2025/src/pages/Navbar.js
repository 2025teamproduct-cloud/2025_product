// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <h1 className="navbar-title">
          <Link to="/" className="navbar-home-link">近場のグルメ season2</Link>
        </h1>
        <div className="navbar-link">
          <Link to="/mypage">マイページへ</Link>
          <img src="Image.jpg" alt=""></img>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
