import React from 'react';
import { IndexLink, Link } from 'react-router';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import classnames from 'classnames';

import SearchForm from './elements/search-form';
import Sidebar from './elements/sidebar';
import Footer from './elements/footer';
import UserCard from './elements/user-card';
import { getCurrentRouteName, toggleSidebar } from '../utils';
import throbber100 from 'assets/images/throbber.gif';

class App extends React.Component {
  // Here we have some handling of drag-n-drop, because standard dragenter
  // and dragleave events suck. Current implementation is using ideas from
  // Ben Smithett, see http://bensmithett.github.io/dragster/ for details

  constructor(props) {
    super(props);

    this.state = { isDragOver: false };

    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);

    this.dragFirstLevel = false;
    this.dragSecondLevel = false;
  }

  containsFiles(e) {
    if (e.dataTransfer && e.dataTransfer.types) {
      // Event.dataTransfer.types is DOMStringList (not Array) in Firefox,
      // so we can't just use indexOf().
      for (let i=0; i<e.dataTransfer.types.length; i++) {
        if (e.dataTransfer.types[i] === 'Files') {
          return true;
        }
      }
    }
    return false;
  }

  handleDragEnter(e) {
    if (this.containsFiles(e)) {
      if (this.dragFirstLevel) {
        this.dragSecondLevel = true;
        return;
      }
      this.dragFirstLevel = true;

      this.setState({ isDragOver: true });

      e.preventDefault();
    }
  }

  handleDragLeave(e) {
    if (this.containsFiles(e)) {
      if (this.dragSecondLevel) {
        this.dragSecondLevel = false;
      } else if (this.dragFirstLevel) {
        this.dragFirstLevel = false;
      }

      if (!this.dragFirstLevel && !this.dragSecondLevel) {
        this.setState({ isDragOver: false });
      }

      e.preventDefault();
    }
  }

  // Prevent browser from loading the file if user drops it outside of a dropzone
  // (both `handleDragOver` and `handleDrop` are necessary)
  handleDragOver(e) {
    if (this.containsFiles(e)) {
      e.preventDefault();
    }
  }
  handleDrop(e) {
    if (this.containsFiles(e)) {
      this.setState({ isDragOver: false });
      this.dragFirstLevel = false;
      this.dragSecondLevel = false;
      e.preventDefault();
    }
  }

  toggleSidebar(e) {
    e.preventDefault();
    toggleSidebar();
  }

  componentDidMount() {
    window.addEventListener('dragenter', this.handleDragEnter);
    window.addEventListener('dragleave', this.handleDragLeave);
    window.addEventListener('dragover', this.handleDragOver);
    window.addEventListener('drop', this.handleDrop);
  }

  componentWillUnmount() {
    window.removeEventListener('dragenter', this.handleDragEnter);
    window.removeEventListener('dragleave', this.handleDragLeave);
    window.removeEventListener('dragover', this.handleDragOver);
    window.removeEventListener('drop', this.handleDrop);
  }

  render() {
    let props = this.props;

    let appClasses = classnames({
      'container': true,
      'unauthenticated': !props.authenticated,
      'dragover': this.state.isDragOver,
    });

    const titlePrefix = (props.unreadDirectsNumber > 0 ? '(' + props.unreadDirectsNumber + ') ' : '');
    const title = titlePrefix + props.title;

    return (
      <div className={appClasses}>
        <Helmet title={title} />

        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'none' }}>
          <symbol id="icon-comment" viewBox="0 0 29 28">
            <path fill="currentColor" d="M29 12c0 5.8-6.5 10.5-14.5 10.5l-2.1-.1a17 17 0 0 1-9 4c-.6 0-1.3-.2-1.4-1-.1-.6.2-.9.5-1.3 1.1-1 2-2 2.7-4C2 18 0 15.3 0 12 0 6.2 6.5 1.5 14.5 1.5S29 6.2 29 12z"/>
            <path d="M14.5 4.5C9.1 4.5 3 7.5 3 12c0 2.2 1.7 4.3 4 5.6l1.7 1-.5 2-.6 1.5 2.6-1.7 1.2-1.1 3.1.2c6 0 11.5-3.3 11.5-7.5 0-3.4-4.4-7.4-11.5-7.5z"/>
          </symbol>
          <symbol id="icon-comment-plus" viewBox="0 0 29 28">
            <path fill="currentColor" d="M14.5 4.5C9.1 4.5 3 7.5 3 12c0 2.2 1.7 4.3 4 5.6l1.7 1-.5 2-.6 1.5 2.6-1.7 1.2-1.1 3.1.2c6 0 11.5-3.3 11.5-7.5 0-3.4-4.4-7.4-11.5-7.5zM29 12c0 5.8-6.5 10.5-14.5 10.5l-2.1-.1a17 17 0 0 1-9 4c-.6 0-1.3-.2-1.4-1-.1-.6.2-.9.5-1.3 1.1-1 2-2 2.7-4C2 18 0 15.3 0 12 0 6.2 6.5 1.5 14.5 1.5S29 6.2 29 12z"/>
            <circle fill="currentColor" cx="20.5" cy="18.5" r="8.5"/>
            <path d="M26 19.2v-1.4c0-.4-.4-.9-.7-.9H22v-3.2c0-.4-.5-.7-.9-.7h-1.4c-.4 0-.7.3-.7.7V17h-3.3c-.4 0-.7.4-.7.8v1.4c0 .4.3.8.7.8H19v3.3c0 .4.3.7.7.7h1.4c.4 0 .9-.3.9-.7V20h3.3c.4-.1.7-.5.7-.8z"/>
          </symbol>
          <symbol id="icon-envelope" viewBox="0 0 26 28">
            <path d="M26 10.45v11.28A2.3 2.3 0 0 1 23.68 24H2.32A2.3 2.3 0 0 1 0 21.73V10.45a8 8 0 0 0 1.46 1.23c2.41 1.61 4.85 3.21 7.22 4.9 1.21.89 2.72 1.97 4.3 1.97h.03c1.58 0 3.1-1.08 4.31-1.96 2.37-1.68 4.8-3.3 7.23-4.9A8.52 8.52 0 0 0 26 10.44zm0-4.18c0 1.6-1.2 3.03-2.48 3.9-2.27 1.53-4.54 3.06-6.8 4.61-.94.64-2.53 1.95-3.7 1.95h-.04c-1.17 0-2.77-1.3-3.71-1.95-2.25-1.55-4.53-3.08-6.77-4.62C1.47 9.48 0 7.88 0 6.58 0 5.2.77 4 2.32 4h21.36A2.31 2.31 0 0 1 26 6.27z"/>
          </symbol>
          <symbol id="icon-globe" viewBox="0 0 24 28">
            <path d="M12 2a12 12 0 0 1 12 12 12 12 0 0 1-12 12A12 12 0 0 1 0 14 12 12 0 0 1 12 2zm5 8.2c0-.3-.5-.4-.5-.4s1.4-.2 1.6 0l.8-.5v-.8s-.7.1-.8 0c-.4 0-.8-1.2-1-1.2l-.6.3s-1.7-1.2-1.8-1.1c-.2 0-.4 1.1-.4 1.1 0 .2.3.2.3.5s-.5 1.3-.6 1.3c-.3.1-.5-.9-.8-1 0 0-2-.9-2.3-.8l.6-1.4c.2 0 1.5-.7 1.8-.7.3 0 .1-.8 0-.8l-1.3.1s-1.1-.4-1.2-.2c-.2.4-.1.4-.1.6-.1 0-1.5.1-1.6-.1l-.5-.3-1.3.4c-1.5.9-2.8 2-3.7 3.5l.5.7.7.4-.1 2.1.9 1.7c.2 0 2.8 2.8 2.9 2.9.2.3 0 .6.2.8.4.6 2.5 1.6 3.8 1.7l.3.7s.9.8 1.1.8c.2 0 .2-.4.2-.5-.3.1-.6 0-.8-.3 0 0 0-1.2-.2-1.4H12s.7-1.4 0-1.4c-.2 0-.4.7-.7.8h-.7c-.3-.2-.3-1.9-.5-2.3 0 0 1.8-.6 2-.8l1.4 1.3c.4.2.3-.4.3-.6 0 0-.4-1-.1-1.2l1-.7-.3-.7 2.1-1.7c.6 0 .5-.8.5-.8zm-3.3 13.6a10 10 0 0 0 5.5-3s-1.6-1.1-1.9-1l-.3.2s-1.2-.4-1.3-.6c-.2-.2-.5.1-.7.2l-.4.6c0-.1-.3 0-.4-.2l.2 1.2-.6 1.3-.1 1.3z"/>
          </symbol>
          <symbol id="icon-lock" viewBox="0 0 18 28">
            <path d="M5 12h8V9a4 4 0 0 0-8 0v3zm13 1.5v9c0 .8-.7 1.5-1.5 1.5h-15C.7 24 0 23.3 0 22.5v-9c0-.8.7-1.5 1.5-1.5H2V9c0-3.8 3.2-7 7-7s7 3.2 7 7v3h.5c.8 0 1.5.7 1.5 1.5z"/>
          </symbol>
          <symbol id="icon-users" viewBox="0 0 28 28">
            <path d="M17.5 20.41c0 1.93-1.31 3.59-2.89 3.59H2.9C1.3 24 0 22.34 0 20.41c0-3.59.87-7.79 4.46-7.79a6.15 6.15 0 0 0 8.58 0c3.5 0 4.46 4.2 4.46 7.8zM14 8.25a5.28 5.28 0 0 1-5.25 5.25A5.28 5.28 0 0 1 3.5 8.25 5.28 5.28 0 0 1 8.75 3 5.28 5.28 0 0 1 14 8.25z"/>
            <path d="M17.8 15c.03 0-.03 0 0 0a5.1 5.1 0 0 0 6.38-.73c3 0 3.82 3.6 3.82 6.66 0 1.65-1.12 3.07-2.47 3.07l-8.26-.04a4.21 4.21 0 0 0 1.48-3.27c0-2.24-.09-3.87-.95-5.69zm7.2-4.47c0 2.46-2.02 4.49-4.48 4.49a4.51 4.51 0 0 1-4.5-4.5c0-2.46 2.03-4.48 4.5-4.48 2.46 0 4.49 2.02 4.49 4.49z"/>
          </symbol>
        </svg>

        <header className="row">
          <div className="col-xs-8 col-sm-4 col-md-3">
            <h1>
              <IndexLink to="/">FreeFeed</IndexLink>

              {props.isLoading ? (
                <span className="loading"><img src={throbber100} width="30" height="30"/></span>
              ) : (
                <sup className="gamma" title="Gamma">&gamma;</sup>
              )}

              <div className="tagline">The Greek letter for the rest of us</div>
            </h1>
          </div>

          <div className="col-xs-4 col-sm-8 col-md-9 text-right">
            {props.authenticated ? (
              <div>
                {props.routeName !== 'search' ? (
                  <SearchForm position="in-header"/>
                ) : false}

                <div className="mobile-sidebar-toggle" onTouchEnd={this.toggleSidebar} onClick={this.toggleSidebar}>
                  <i className="fa fa-bars" aria-hidden="true"></i>
                  <i className="fa fa-times" aria-hidden="true"></i>
                  {props.unreadDirectsNumber > 0 ? (
                    <span className="direct-messages-badge">{props.unreadDirectsNumber}</span>
                  ) : false}
                </div>
              </div>
            ) : (
              <Link to="/signin" className="signin-link">Sign in</Link>
            )}
          </div>
        </header>

        {props.authenticated ? (
          <div className="row">
            <div className="content col-md-9">{props.children}</div>
            <Sidebar/>
          </div>
        ) : (
          <div className="row">
            <div className="content col-md-12">{props.children}</div>
          </div>
        )}

        <Footer/>

        <UserCard/>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    unreadDirectsNumber: state.me.unreadDirectsNumber,
    authenticated: state.authenticated,
    isLoading: state.routeLoadingState,
    routeName: getCurrentRouteName(ownProps),
    offset: state.routing.locationBeforeTransitions.query.offset,
    title: state.title
  };
}

export default connect(mapStateToProps)(App);
