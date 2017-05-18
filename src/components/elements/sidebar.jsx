import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { unauthenticated } from '../../redux/action-creators';
import { toggleSidebar, confirmFirst, preventDefault, stopPropagation } from '../../utils';
import UserName from './user-name';
import SearchForm from './search-form';
import RecentGroups from './recent-groups';

const Sidebar = ({ user, signOut }) => (
  <div className="col-md-3 sidebar-overlay" onClick={toggleSidebar}>
    <div className="sidebar" onClick={stopPropagation}>
      <div className="logged-in">
        <div className="userpic">
          <Link to={`/${user.username}`} ><img src={user.profilePictureMediumUrl} width="50" height="50"/></Link>
        </div>

        <div className="user">
          <div className="author">
            <UserName user={user} display={user.screenName}/>
          </div>
          <div>
            <Link to="/settings">settings</Link>
            &nbsp;-&nbsp;
            <a onClick={confirmFirst(signOut)}>sign out</a>
          </div>
        </div>
      </div>

      <SearchForm />

      <div className="box">
        <div className="box-header">
          People
        </div>
        <div className="box-body">
          <ul>
            <li><Link to="/">
              <i className="fa fa-home fa-fw"></i>
              Home
            </Link></li>

            <li><Link to="/filter/discussions">
              <i className="fa fa-comments fa-fw"></i>
              My discussions
            </Link></li>

            <li><Link to="/filter/direct" style={user.unreadDirectsNumber > 0 ? { fontWeight: 'bold' } : {}}>
              <i className="fa fa-envelope fa-fw"></i>
              Direct messages
              {user.unreadDirectsNumber > 0 ? ` (${user.unreadDirectsNumber})` : false}
            </Link></li>
          </ul>
        </div>
        <div className="box-footer">
          <Link to="/people">Browse/edit people</Link>
        </div>
      </div>

      <div className="box">
        <div className="box-header">
          Groups
        </div>
        <div className="box-body">
          <RecentGroups/>
        </div>
        <div className="box-footer">
          <Link to="/groups">Browse/edit groups</Link>
        </div>
      </div>

      <div className="box">
        <div className="box-header">
          Info
        </div>
        <div className="box-body">
          <ul>
            <li><Link to="/freefeed">News</Link></li>
            <li><Link to="/support">Support</Link></li>
          </ul>
        </div>
      </div>

      <div className="box">
        <div className="box-header">
          Coin Jar
        </div>
        <div className="box-body">
          <ul>
            <li><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=freefeed%2enet%40gmail%2ecom&lc=EE&item_name=FreeFeed%20MTU&no_note=0&cn=Add%20special%20instructions%20to%20the%20seller%3a&no_shipping=2&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted" target="_blank" rel="noopener">
              Donate to support FreeFeed
            </a></li>
          </ul>
        </div>
      </div>

      <div className="box hidden-on-mobile">
        <div className="box-header">
          Bookmarklet
        </div>
        <div className="box-footer">
          Once added to your toolbar, this button will let you share web pages on your FreeFeed.
          You can even attach thumbnails of images from the page you share!
        </div>
        <div className="box-footer">
          Click and drag
          {' '}
          <a className="bookmarklet-button"
            href="javascript:(function(){var v='1.9.1';if(window.jQuery===undefined||window.jQuery.fn.jquery<v){var done=false;var script=document.createElement('script');script.src='//ajax.googleapis.com/ajax/libs/jquery/'+v+'/jquery.min.js';script.onload=script.onreadystatechange=function(){if(!done&&(!this.readyState||this.readyState=='loaded'||this.readyState=='complete')){done=true;initMyBookmarklet()}};document.getElementsByTagName('head')[0].appendChild(script)}else{initMyBookmarklet()}function initMyBookmarklet(){(window.myBookmarklet=function(){var addScript=function(filename,callback){var e=document.createElement('script');e.type='text/javascript';e.src=filename;if(callback){e.onloadDone=false;e.onload=function(){e.onloadDone=true;callback()};e.onReadystatechange=function(){if(e.readyState==='loaded'&&!e.onloadDone){e.onloadDone=true;callback()}}}if(typeof e!=='undefined'){document.getElementsByTagName('head')[0].appendChild(e)}};var host='https://gamma.freefeed.net';addScript(host+'/assets/bookmarklet-popup.js',function(){bookmarklet_popupInit(host)})})()}})()"
            onClick={preventDefault(() => false)}>Share on FreeFeed</a>
          {' '}
          to&nbsp;your toolbar.
        </div>
      </div>
    </div>
  </div>
);

function makeMapStateToProps(state) {
  return {
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    signOut: () => dispatch(unauthenticated())
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(Sidebar);
