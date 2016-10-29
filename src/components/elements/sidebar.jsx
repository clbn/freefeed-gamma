import React from 'react';
import {Link} from 'react-router';

import {preventDefault} from '../../utils';
import UserName from './user-name';
import SearchForm from './search-form';
import RecentGroups from './recent-groups';

export default ({user, signOut, toggleSidebar, routeName}) => (
  <div className="sidebar-wrapper" onClick={() => toggleSidebar()}>
    <div className="col-md-3 sidebar" onClick={(e) => e.stopPropagation()}>
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
            <a onClick={preventDefault(signOut)}>sign out</a>
          </div>
        </div>
      </div>

      {routeName !== 'search' ? (
        <SearchForm />
      ) : false}

      <div className="box">
        <div className="box-header-friends">
          Friends
        </div>
        <div className="box-body">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/filter/direct">Direct messages</Link></li>
            <li><Link to="/filter/discussions">My discussions</Link></li>
          </ul>
        </div>
        <div className="box-footer">
          <Link to="/friends">Browse/edit friends</Link>
        </div>
      </div>

      <div className="box">
        <div className="box-header-groups">
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
        <div className="box-header-groups">
          Info
        </div>
        <div className="box-body">
          <ul>
            <li><Link to="/freefeed">News</Link></li>
            <li><Link to="/support">Support</Link></li>
          </ul>
        </div>
      </div>

      <div className="box hidden-on-mobile">
        <div className="box-header-groups">
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
