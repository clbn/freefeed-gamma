import React from 'react';
import { IndexLink, Link } from 'react-router';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import classnames from 'classnames';

import SearchForm from './elements/search-form';
import Sidebar from './elements/sidebar';
import Footer from './elements/footer';
import UserCard from './elements/user-card';
import IconDefinitions from "./elements/icon-definitions";
import Icon from "./elements/icon";
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
        <Helmet title={title}/>

        <IconDefinitions/>

        <header className="row">
          <div className="col-xs-8 col-sm-4 col-md-3">
            <h1>
              <IndexLink to="/">FreeFeed</IndexLink>

              {props.isLoading ? (
                <span className="loading"><img src={throbber100} width="30" height="30"/></span>
              ) : (
                <svg className="gamma" viewBox="0 0 40 58" xmlns="http://www.w3.org/2000/svg">
                  <title>Gamma</title>
                  <path d="M39.1 1a116.6 116.6 0 0 1-10.7 34.3c-1.6 3-3.3 6-5.1 8.6V57h-9V46c0-3.2-.5-6.8-1.3-10.9A120.4 120.4 0 0 0 .5 1h10a135.5 135.5 0 0 1 8.9 22.1l1.7 7.5h.2A79.6 79.6 0 0 0 29.7 1H39z"/>
                </svg>
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
                  <Icon name="bars"/>
                  <Icon name="times"/>
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
    title: state.pageView.title
  };
}

export default connect(mapStateToProps)(App);
