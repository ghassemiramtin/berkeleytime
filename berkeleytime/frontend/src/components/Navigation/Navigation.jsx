import React from 'react';
import NavigationLinks from '../NavigationLinks/NavigationLinks';

import appRoutes from '../../routes/app';

function Navigation() {
  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand bt-navbar-brand">
        <a className="navbar-item" href='/'>BerkeleyTime</a>

        <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarOptions" onClick={() => { let toggle = document.querySelector(".navbar-burger"); let menu = document.querySelector(".navbar-menu"); toggle.classList.toggle("is-active"); menu.classList.toggle("is-active"); }}>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div className="navbar-menu" id="navbarOptions">
        <NavigationLinks />
      </div>
    </nav>
  );
}

export default Navigation;
