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

    const titlePrefix = (props.user.unreadDirectsNumber > 0 ? '(' + props.user.unreadDirectsNumber + ') ' : '');
    const title = titlePrefix + props.title;

    return (
      <div className={appClasses}>
        <Helmet title={title} />

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
                  <SearchForm />
                ) : false}

                <div className="mobile-sidebar-toggle" onTouchEnd={this.toggleSidebar} onClick={this.toggleSidebar}>
                  <i className="fa fa-bars" aria-hidden="true"></i>
                  <i className="fa fa-times" aria-hidden="true"></i>
                  {props.user.unreadDirectsNumber > 0 ? (
                    <span className="direct-messages-badge">{props.user.unreadDirectsNumber}</span>
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
    user: state.user,
    authenticated: state.authenticated,
    isLoading: state.routeLoadingState,
    routeName: getCurrentRouteName(ownProps),
    offset: state.routing.locationBeforeTransitions.query.offset,
    title: state.title
  };
}

export default connect(mapStateToProps)(App);
