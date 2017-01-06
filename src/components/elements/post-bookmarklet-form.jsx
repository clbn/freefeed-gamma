import React from 'react';
import { preventDefault } from '../../utils';
import throbber16 from 'assets/images/throbber-16.gif';
import PostRecipients from './post-recipients';

export default class PostBookmarkletForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFormEmpty: false,
      isPostSaved: false
    };
  }

  refPostRecipients = (input) => { this.postRecipients = input; };
  refPostText = (input) => { this.postText = input; };
  refCommentText = (input) => { this.commentText = input; };

  checkCreatePostAvailability = () => {
    const isPostTextEmpty = (this.postText.value == '' || /^\s+$/.test(this.postText.value));
    let isFormEmpty = (isPostTextEmpty || this.postRecipients.values == 0);

    this.setState({
      isFormEmpty
    });
  };

  checkSave = (e) => {
    const isEnter = e.keyCode === 13;
    const isShiftPressed = e.shiftKey;
    if (isEnter && !isShiftPressed) {
      e.preventDefault();
      if (!this.state.isFormEmpty && this.props.createPostForm.status !== 'loading') {
        this.submitForm();
      }
    }
  };

  submitForm = () => {
    // Get all the values
    const feeds = this.postRecipients.values;
    const postText = this.postText.value;
    const imageUrls = this.props.imageUrls;
    const commentText = this.commentText.value;

    // Send to the server
    this.props.createPost(feeds, postText, imageUrls, commentText);
  };

  componentWillReceiveProps(newProps) {
    // If it was successful saving, clear the form
    if (this.props.createPostForm.status === 'loading' && newProps.createPostForm.status === 'success') {
      this.setState({
        isPostSaved: true
      });
    }
  }

  // Height of bookmarklet contents might change, in this case we should
  // inform the script outside the iframe to update iframe size accordingly
  componentDidUpdate() {
    window.parent.postMessage(document.documentElement.offsetHeight, '*');
  }

  componentWillUnmount() {
    this.props.resetPostCreateForm();
  }

  render() {
    if (this.state.isPostSaved) {
      const postUrl = `/${this.props.user.username}/${this.props.createPostForm.lastPost.id}`;
      return (
        <div className="brand-new-post">
          Done! Check out<br/>
          <a href={postUrl} target="_blank" rel="noopener">your brand new post</a>
        </div>
      );
    }

    const linkedImages = this.props.imageUrls.map((url, i) => (
      <div className="post-linked-image" key={i} onClick={()=>this.props.removeImage(url)} title="Remove image">
        <img src={url} />
      </div>
    ));

    return (
      <div className="create-post post-editor expanded">
        {this.props.createPostForm.status === 'error' ? (
          <div className="post-error alert alert-danger" role="alert">
            Post has not been saved. Server response: "{this.props.createPostForm.errorMessage}"
          </div>
        ) : false}

        <PostRecipients ref={this.refPostRecipients}
          feeds={this.props.sendTo.feeds}
          defaultFeed={this.props.sendTo.defaultFeed}
          user={this.props.user}
          onChange={this.checkCreatePostAvailability}/>

        <textarea
          className="form-control post-textarea"
          ref={this.refPostText}
          defaultValue={this.props.postText}
          onKeyDown={this.checkSave}
          onChange={this.checkCreatePostAvailability}
          rows={3}
          maxLength="1500"/>

        {this.props.imageUrls.length ? (
          linkedImages
        ) : (
          <div className="post-linked-image-empty">Click on images<br/>to share them</div>
        )}

        <div className="comment">
          <a className="comment-icon comment-icon-special fa-stack">
            <i className="fa fa-comment fa-stack-1x"></i>
            <i className="fa fa-comment-o fa-stack-1x"></i>
          </a>

          <div className="comment-body">
            <textarea
              className="form-control comment-textarea"
              ref={this.refCommentText}
              defaultValue={this.props.commentText}
              onKeyDown={this.checkSave}
              onChange={this.checkCreatePostAvailability}
              rows={4}
              maxLength="1500"/>
          </div>
        </div>

        <div className="post-edit-actions">
          {this.props.createPostForm.status === 'loading' ? (
            <span className="post-edit-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}

          <button className="btn btn-default"
            onClick={preventDefault(this.submitForm)}
            disabled={this.state.isFormEmpty || this.props.createPostForm.status === 'loading'}>Post</button>
        </div>
      </div>
    );
  }
}
