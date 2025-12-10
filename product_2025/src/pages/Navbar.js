import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";
import imageFile from '../img/Image.jpg';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-inner">

        <h1 className="navbar-title">
          <Link to="/" className="navbar-home-link">
            <img 
              src={imageFile} 
              alt="近場のグルメ season2 ロゴ"
              className="navbar-logo"
            />
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
