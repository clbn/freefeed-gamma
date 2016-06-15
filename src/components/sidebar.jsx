import React from 'react';
import {Link} from 'react-router';

import UserName from './user-name';
import {preventDefault} from '../utils';
import RecentGroups from './recent-groups';

export default ({user, signOut, recentGroups, toggleSidebar}) => (
  <div className="sidebar-wrapper" onClick={() => toggleSidebar()}>
    <div className="col-md-3 sidebar" onClick={(e) => e.stopPropagation()}>
      <div className='logged-in'>
        <div className='userpic'>
          <Link to={`/${user.username}`} ><img src={user.profilePictureMediumUrl} width="50" height="50"/></Link>
        </div>

        <div className='user'>
          <div className='author'>
            <UserName user={user} display={user.screenName}/>
          </div>
          <div>
            <Link to='/settings'>settings</Link>
            &nbsp;-&nbsp;
            <a onClick={preventDefault(signOut)}>sign out</a>
          </div>
        </div>
      </div>

      <div className='box'>
        <div className='box-header-friends'>
          Friends
        </div>
        <div className='box-body'>
          <ul>
            <li className='p-home'><Link to='/'>Home</Link></li>
            <li className='p-direct-messages'><Link to='/filter/direct'>Direct messages</Link></li>
            <li className='p-my-discussions'><Link to='/filter/discussions'>My discussions</Link></li>
          </ul>
        </div>
        <div className='box-footer'>
          <Link to={`/friends`}>Browse/edit friends</Link>
        </div>
      </div>

      <div className='box'>
        <div className='box-header-groups'>
          Groups
        </div>
        <div className='box-body'>
          <RecentGroups recentGroups={recentGroups}/>
        </div>
        <div className='box-footer'>
          <Link to='/groups'>Browse/edit groups</Link>
        </div>
      </div>

      <div className='box'>
        <div className='box-header-groups'>
          Info
        </div>
        <div className='box-body'>
          <ul>
            <li><Link to='/freefeed'>News</Link></li>
            <li><Link to='/support'>Support</Link></li>
          </ul>
        </div>
        <div className='box-footer'>

        </div>
      </div>

      <div className='box'>
        <div className='box-header-groups'>
          Bookmarklet
        </div>
        <div className='box-footer'>
          Once added to your toolbar, this button will let you share web pages on your FreeFeed.
          You can even attach thumbnails of images from the page you share!
        </div>
        <div className='box-footer'>
          Click and drag
          {' '}
          <a className="bookmarklet-button" href="BOOKMARKLET_PLACEHOLDER" onClick={preventDefault(() => false)}>Share on FreeFeed</a>
          {' '}
          to&nbsp;your toolbar.
        </div>
      </div>
    </div>
  </div>
);
