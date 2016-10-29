import React from 'react';
import {IndexLink, Link} from 'react-router';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import classnames from 'classnames';

import {unauthenticated, home, toggleSidebar} from '../redux/action-creators';
import SearchForm from './search-form';
import Sidebar from './sidebar';
import Footer from './footer';
import UserCard from './user-card';
import {getCurrentRouteName} from '../utils';
import throbber100 from 'assets/images/throbber.gif';

const logoHandler = (routeName, offset, cb) => () => {
  if (routeName === 'home' && !offset) {
    return cb();
  }
  return false;
};

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

    let layoutClassNames = classnames({
      'container': true,
      'unauthenticated': !props.authenticated,
      'dragover': this.state.isDragOver,
      'mobile-sidebar-open': props.sidebarViewState.isOpen
    });

    return (
      <div className={layoutClassNames}>
        <Helmet title={props.title} />

        <header className="row">
          <div className="col-xs-9 col-md-4">
            <h1>
              <IndexLink to="/" onClick={logoHandler(props.routeName, props.offset, props.home)}>FreeFeed</IndexLink>

              {props.isLoading ? (
                <span className="loading"><img src={throbber100} width="30" height="30"/></span>
              ) : (
                <sup className="gamma" title="Gamma">&gamma;</sup>
              )}

              <div className="tagline">The Greek letter for the rest of us</div>
            </h1>
          </div>

          <div className="col-xs-3 col-md-8 text-right">
            {props.authenticated ? (
              <div>
                {props.routeName !== 'search' ? (
                  <SearchForm />
                ) : false}

                <div className="mobile-sidebar-toggle" onClick={() => props.toggleSidebar()}>
                  <i className="fa fa-bars" aria-hidden="true"></i>
                </div>
              </div>
            ) : (
              <div className="signin-link">
                <Link to="/signin">Sign In</Link>
              </div>
            )}
          </div>
        </header>

        {props.authenticated ? (
          <div className="row">
            <div className="content col-md-9">{props.children}</div>
            <Sidebar {...props}/>
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
    title: state.title,
    sidebarViewState: state.sidebarViewState
  };
}

function mapDispatchToProps(dispatch) {
  return {
    signOut: ()=>dispatch(unauthenticated()),
    home: ()=> dispatch(home()),
    toggleSidebar: () => dispatch(toggleSidebar())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
