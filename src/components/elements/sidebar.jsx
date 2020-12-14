import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { unauthenticated } from '../../redux/action-creators';
import { toggleSidebar, confirmFirst, preventDefault, stopPropagation } from '../../utils';
import SearchForm from './search-form';
import RecentGroups from './recent-groups';
import Icon from "./icon";
import Userpic from './userpic';

const Vote2020 = ({ voteToken }) => {
  if (!voteToken) {
    return null;
  }

  return (
    <div className="box alert alert-info" style={{ paddingTop: '10px' }}>
      <div className="box-header">
        Vote 2020
      </div>
      <div style={{ color: '#000', fontSize: '13px', paddingBottom: 0, borderBottom: '2px solid #000', marginBottom: '10px' }}>
        <p>Elections to the <b>Supervisory Board</b> in December 2020</p>
        <ul style={{ paddingLeft: '15px' }}>
          <li><Link to={{ pathname: '/freefeed/da348e20-4075-4431-b4c8-6bd4a6e97e9a', query: {} }}
            style={{ textDecoration: 'underline' }}>Details in English</Link></li>
          <li><Link to={{ pathname: '/freefeed/6a64ded1-143f-4d11-9f7b-f9c8ac8b7f95', query: {} }}
            style={{ textDecoration: 'underline' }}>Подробности на русском</Link></li>
        </ul>
      </div>

      {voteToken === true ? (

        <div style={{ color: '#000', fontSize: '13px', paddingBottom: 0 }}>
          <p>
            Voting will begin at<br/>
            <b>15 Dec 2020, 12:00 MSK</b>
          </p>
          <p style={{ marginBottom: 0 }}>
            Voting will end at<br/>
            <b>16 Dec 2020, 12:00 MSK</b>
          </p>
        </div>

      ) : voteToken === 'finished' ? (

        <div style={{ color: '#000', fontSize: '13px', paddingBottom: 0 }}>
          <p>Voting has ended.</p>
          <p style={{ marginBottom: 0 }}>
            The results will be published in{' '}
            <Link to={{ pathname: '/freefeed', query: {} }} style={{ textDecoration: 'underline' }}>
              @freefeed
            </Link>
            {' '}account.
          </p>
        </div>

      ) : (

        <div style={{ color: '#000', fontSize: '13px', paddingBottom: 0 }}>
          <p>Voting has begun.</p>
          <p>
            Please vote{' '}
            <b><a href="https://ffelection20.questionpro.com/" target="_blank" style={{ textDecoration: 'underline' }}>
              using this link
            </a></b>
            {' '}with your unique vote key:
          </p>
          <p style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}>
            <b>{voteToken}</b>
          </p>
          <p style={{ marginBottom: 0 }}>
            Voting will end at <br/>
            <b>16 Dec 2020, 12:00 MSK</b>
          </p>
        </div>

      )}
    </div>
  );
};

const Sidebar = ({ me, signOut }) => {
  const bookmarkletRef = useRef(null);

  useEffect(() => {
    bookmarkletRef.current.setAttribute('href', "javascript:(function(){var v='1.9.1';if(window.jQuery===undefined||window.jQuery.fn.jquery<v){var done=false;var script=document.createElement('script');script.src='//ajax.googleapis.com/ajax/libs/jquery/'+v+'/jquery.min.js';script.onload=script.onreadystatechange=function(){if(!done&&(!this.readyState||this.readyState=='loaded'||this.readyState=='complete')){done=true;initMyBookmarklet()}};document.getElementsByTagName('head')[0].appendChild(script)}else{initMyBookmarklet()}function initMyBookmarklet(){(window.myBookmarklet=function(){var addScript=function(filename,callback){var e=document.createElement('script');e.type='text/javascript';e.src=filename;if(callback){e.onloadDone=false;e.onload=function(){e.onloadDone=true;callback()};e.onReadystatechange=function(){if(e.readyState==='loaded'&&!e.onloadDone){e.onloadDone=true;callback()}}}if(typeof e!=='undefined'){document.getElementsByTagName('head')[0].appendChild(e)}};var host='https://gamma.freefeed.net';addScript(host+'/assets/bookmarklet-popup.js',function(){bookmarklet_popupInit(host)})})()}})()");
  }, []);

  return (
    <div className="col-md-3 sidebar-overlay" onClick={toggleSidebar}>
      <div className="sidebar" onClick={stopPropagation}>
        <div className="logged-in">
          <div className="userpic">
            <Link to={`/${me.username}`}><Userpic id={me.id} size={50}/></Link>
          </div>

          <div className="user">
            <div className="author">
              <Link to={`/${me.username}`}>{me.screenName}</Link>
            </div>

            <Link to="/settings">settings</Link>
            {' - '}
            <a onClick={confirmFirst(signOut)}>sign out</a>
          </div>
        </div>

        <SearchForm position="in-sidebar"/>

        <div className="box">
          <div className="box-header">
            People
          </div>
          <div className="box-body">
            <ul>
              <li><Link to="/">
                <Icon name="home"/>
                Home
              </Link></li>

              <li><Link to="/filter/discussions">
                <Icon name="comments"/>
                My discussions
              </Link></li>

              <li><Link to="/filter/direct" style={me.unreadDirectsNumber > 0 ? { fontWeight: 'bold' } : {}}>
                <Icon name="envelope"/>
                Direct messages
                {me.unreadDirectsNumber > 0 ? ` (${me.unreadDirectsNumber})` : false}
              </Link></li>

              <li><Link to="/filter/saves">
                <Icon name="bookmark"/>
                Saved for later
              </Link></li>

              <li><Link to="/summary/1">
                <Icon name="heartbeat"/>
                Best of day
              </Link></li>
            </ul>
          </div>
          <div className="box-footer">
            <Link to="/people">Browse/edit people</Link>
          </div>
        </div>

        <Vote2020 voteToken={me.privateMeta?.vote2020}/>

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
            Donate to support FreeFeed! Your regular donations pay for hosting and keep FreeFeed running.
          </div>
          <div className="box-footer">
            <Link to="/about/donate">See donation options →</Link>
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
              ref={bookmarkletRef}
              onClick={preventDefault(() => false)}>Share on FreeFeed</a>
            {' '}
            to&nbsp;your toolbar.
          </div>
        </div>
      </div>
    </div>
  );
};

function makeMapStateToProps(state) {
  return {
    me: state.me
  };
}

function mapDispatchToProps(dispatch) {
  return {
    signOut: () => dispatch(unauthenticated())
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(Sidebar);
