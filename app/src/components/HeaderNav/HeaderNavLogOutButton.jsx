import React from 'react';
import { Router, Link } from 'react-router';
import axios from 'axios';

const HeaderNavLogOutButton = ({name, link}) => {
  return (
    <li><Link to={link} onClick={logOut}>{name}</Link></li>
  );
}

const logOut = () => {

  //GET request to delete cookies, logging you out
  axios.get('/auth/logout')
}

export default HeaderNavLogOutButton;
