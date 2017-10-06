import React from 'react';
import { Router, Link } from 'react-router';

import HeaderNav from './components/HeaderNav/HeaderNav';
import AppHeader from './components/App/AppHeader';

class RouteTestScraper extends React.Component {
  constructor(){
    super()
    this.state = {}

    this.submit = this.submit.bind(this);
  }

  submit(){
    console.log('submited!!')

    $.ajax({
      url: '/api/recipes/nightmare',
      type: 'GET',
      success: function(res){
        console.log('This is the response: ', res);
      }
    })
  }

  render(){
    return (
      <div className="container-fluid">
        <HeaderNav/>
        <AppHeader title={'TEST SCRAPER'}/>
        <div className="row">
          <label>Nightmare</label>
          <input id="nightmare"/>
          <button onClick={this.submit}>Nightmare</button>
        </div>
        <div className="row">
          <label>Other</label>
          <input />
          <button>Other</button>
        </div>
      </div>
    );
  }
}

export default RouteTestScraper;