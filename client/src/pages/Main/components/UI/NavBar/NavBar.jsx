import React from "react";
import c from "./NavBar.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <div className={c.navbar}>
      <div className={c.main}>
        <Link to="/" className={c.text}>
          Web UI ScanOVAL
        </Link>
      </div>
      <div className={c.adminpanel}>
        <Link to="admin" className={c.text}>
          Админ панель
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
