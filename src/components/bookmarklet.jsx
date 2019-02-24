import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';

import { joinCreatePostData } from '../redux/select-utils';
import { createBookmarkletPost, resetPostCreateForm, addAttachmentResponse, removeAttachment } from '../redux/action-creators';
import PostBookmarkletForm from './elements/post-bookmarklet-form';
import SignIn from './signin';

class Bookmarklet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageUrls: []
    };
  }

  // User has selected an image on parent frame
  handleHashChange = () => {
    // Add the image passed via #hash
    const url = window.location.hash.slice(1);
    const imageUrls = this.state.imageUrls;
    if (imageUrls.indexOf(url) === -1) {
      imageUrls.push(url);
      this.setState({ imageUrls });
    }

    // Clear the #hash immediately
    window.history.pushState('', document.title, window.location.pathname + window.location.search);
  };

  removeImage = (url) => {
    const imageUrls = _.without(this.state.imageUrls, url);
    this.setState({ imageUrls });
  };

  componentDidMount() {
    window.addEventListener('hashchange', this.handleHashChange);

    // Auto-select thumbnails on popular services
    const services = [{
      // Instagram
      from: /https?:\/\/www\.instagram\.com\/p\/([\w-]+)\//i,
      to: (id)=>('https://www.instagram.com/p/' + id + '/media/?size=l')
    }, {
      // YouTube
      from: /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)[?=&+%\w.-]*/i,
      to: (id)=>('https://i.ytimg.com/vi/' + id + '/hqdefault.jpg')
    }];
    const pageUrl = this.props.location.query.url;
    const imageUrls = [];
    services.forEach((service) => {
      const m = pageUrl.match(service.from);
      if (m && m[1]) {
        const imageUrl = service.to(m[1]);
        imageUrls.push(imageUrl);
      }
    });
    this.setState({ imageUrls });
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  render() {
    let props = this.props;

    let bookmarkletClasses = classnames({
      'container': true,
      'bookmarklet': true,
      'unauthenticated': !props.authenticated
    });

    return (
      <div className={bookmarkletClasses}>
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'none' }}>
          <symbol id="icon-comment-plus" viewBox="0 0 14 14">
            <path fill="currentColor" d="M7 2.5C4.37 2.47 1.51 4 1.5 6.17c0 1.1.8 2.06 1.92 2.72l.78.54-.23.91-.29.74a6 6 0 0 0 1.23-.81l.61-.54 1.48.1c2.86 0 5.5-1.62 5.5-3.66 0-1.82-2.36-3.63-5.5-3.67zm7 3.66c0 2.84-3.15 5.16-7 5.16l-1.03-.04a8.17 8.17 0 0 1-3.83 1.94c-.16.04-.43.06-.55.06-.26 0-.57-.13-.63-.5-.06-.3.1-.46.24-.67a4.4 4.4 0 0 0 1.3-2C.97 9.2 0 7.81 0 6.16 0 3.31 3.15 1 7 1s7 2.3 7 5.16z"/>
            <circle fill="currentColor" cx="9.75" cy="9.25" r="4.25"/>
            <path d="M12.5 9.6v-.72c0-.2-.16-.38-.36-.38H10.5V6.86c0-.2-.23-.36-.42-.36h-.72c-.2 0-.36.16-.36.36V8.5H7.36c-.2 0-.36.19-.36.39v.71c0 .2.16.4.36.4H9v1.64c0 .2.17.36.36.36h.72c.22 0 .42-.14.42-.36V10h1.64c.21 0 .36-.2.36-.4z"/>
          </symbol>
        </svg>

        <header>
          <h1>
            Share on <a href="/" target="_blank" rel="noopener">FreeFeed</a>
            <sup className="gamma" title="Gamma">&gamma;</sup>
          </h1>
        </header>

        {props.authenticated ? (
          <PostBookmarkletForm
            sendTo={props.sendTo}
            user={props.me}
            postText={props.location.query.title + ' - ' + props.location.query.url}
            imageUrls={this.state.imageUrls}
            commentText={props.location.query.comment}
            createPostForm={props.createPostForm}
            createPost={props.createBookmarkletPost}
            resetPostCreateForm={props.resetPostCreateForm}
            removeImage={this.removeImage}/>
        ) : <>
          <div className="box-message alert alert-warning">You need to sign in first.</div>

          <SignIn/>
        </>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    authenticated: state.authenticated,
    me: state.me,
    sendTo: { ...state.sendTo, defaultFeed: state.me.username },
    createPostForm: joinCreatePostData(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    createBookmarkletPost: (...args) => dispatch(createBookmarkletPost(...args)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    addAttachmentResponse: (...args) => dispatch(addAttachmentResponse(...args)),
    removeAttachment: (...args) => dispatch(removeAttachment(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Bookmarklet);
