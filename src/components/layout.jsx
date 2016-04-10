import React from 'react';
import {IndexLink, Link} from 'react-router';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import classnames from 'classnames';

import {unauthenticated, home} from '../redux/action-creators';
import Footer from './footer';
import Sidebar from './sidebar';
import LoaderContainer from './loader-container';
import {getCurrentRouteName} from '../utils';

const InternalLayout = ({authenticated, children}) => (
  <div className={authenticated ? 'col-md-9' : 'col-md-12'}>
    <div className='content'>
      {children}
    </div>
  </div>
);

const logoHandler = (routeName, cb) => _ => {
  if (routeName === 'home') {
    return cb();
  }
  return false;
};


class Layout extends React.Component {
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
      'dragover': this.state.isDragOver
    });

    return (
      <div className={layoutClassNames}>
        <Helmet title={props.title} />

        <header className="row">
          <div className="col-xs-9 col-sm-6">
            <h1>
              <IndexLink to="/" onClick={logoHandler(props.routeName, props.home)}>FreeFeed</IndexLink>
              <sup title="Gamma">&gamma;</sup>
              <div className="tagline">The Greek letter for the rest of us</div>
            </h1>
          </div>

          {props.authenticated ? (
            <div className="col-xs-12 col-sm-6">
              <div className="mobile-shortcuts">
                <Link to="/filter/discussions">My discussions</Link>
                <Link to="/filter/direct">Direct messages</Link>
                <Link to={`/${props.user.username}`}>My feed</Link>
              </div>
            </div>
          ) : (
            <div className="col-xs-3 col-sm-6 text-right">
              <div className="signin-link">
                <Link to="/signin">Sign In</Link>
              </div>
            </div>
          )}
        </header>

        <LoaderContainer loading={props.loadingView} fullPage={true}>
          <div className='row'>
            <InternalLayout {...props}/>
            {props.authenticated ? <Sidebar {...props}/> : false}
          </div>
        </LoaderContainer>

        <div className='row'>
          <div className='col-md-12'>
          <Footer/>
          </div>
        </div>
      </div>
    );
  }
}

function select(state, ownProps) {
  return {
    user: state.user,
    authenticated: state.authenticated,
    loadingView: state.routeLoadingState,
    recentGroups: state.recentGroups,
    routeName: getCurrentRouteName(ownProps),
    title: state.title
  };
}

function mapDispatchToProps(dispatch) {
  return {
    signOut: ()=>dispatch(unauthenticated()),
    home: ()=> dispatch(home()),
  };
}

export default connect(select, mapDispatchToProps)(Layout);
