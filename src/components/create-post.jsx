import React from 'react';
import {preventDefault} from '../utils';
import Textarea from 'react-textarea-autosize';
import throbber16 from 'assets/images/throbber-16.gif';
import PostRecipients from './post-recipients';
import PostDropzone from './post-dropzone';
import PostAttachments from './post-attachments';

export default class CreatePost extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: false,
      isFormEmpty: true,
      isMoreOpen: false,
      attachmentQueueLength: 0
    };
  }

  expand = () => {
    if (!this.state.isExpanded) {
      this.setState({isExpanded: true});
    }
  };

  toggleMore = () => {
    this.setState({isMoreOpen: !this.state.isMoreOpen});
  };

  submitForm = () => {
    // Get all the values
    const feeds = this.refs.selectFeeds.values;
    const postText = this.refs.postText.value;
    const attachmentIds = this.props.createPostForm.attachments.map(attachment => attachment.id);
    const more = {
      commentsDisabled: (this.refs.commentsDisabled && this.refs.commentsDisabled.checked)
    };

    // Send to the server
    this.props.createPost(feeds, postText, attachmentIds, more);
  };

  clearForm = () => {
    this.refs.postText.value = '';
    setTimeout(() => document.activeElement.blur(), 0);

    this.setState({
      isExpanded: false,
      isFormEmpty: true,
      isMoreOpen: false,
      attachmentQueueLength: 0
    });

    const attachmentIds = this.props.createPostForm.attachments.map(attachment => attachment.id);
    attachmentIds.forEach(this.removeAttachment);
  };

  removeAttachment = (attachmentId) => this.props.removeAttachment(null, attachmentId)

  isPostTextEmpty = (postText) => {
    return postText == '' || /^\s+$/.test(postText);
  }

  checkCreatePostAvailability = (e) => {
    let isFormEmpty = this.isPostTextEmpty(this.refs.postText.value) || this.refs.selectFeeds.values == 0;

    this.setState({
      isFormEmpty
    });
  }

  checkSave = (e) => {
    const isEnter = e.keyCode === 13;
    const isShiftPressed = e.shiftKey;
    if (isEnter && !isShiftPressed) {
      e.preventDefault();
      if (!this.state.isFormEmpty && this.state.attachmentQueueLength === 0 && this.props.createPostForm.status !== 'loading') {
        this.submitForm();
      }
    }
  }

  componentWillReceiveProps(newProps) {
    // If it was successful saving, clear the form
    if (this.props.createPostForm.status === 'loading' && newProps.createPostForm.status === 'success') {
      this.clearForm();
    }
  }

  componentWillUnmount() {
    this.props.resetPostCreateForm();
  }

  render() {
    // DropzoneJS queue handlers
    const handleAddedFile = () => {
      this.setState({attachmentQueueLength: this.state.attachmentQueueLength + 1});
    };
    const handleRemovedFile = () => {
      this.setState({attachmentQueueLength: this.state.attachmentQueueLength - 1});
    };
    const handleUploadSuccess = (attachment) => this.props.addAttachmentResponse(null, attachment);

    return (
      <div className={'create-post post-editor' + (this.state.isExpanded ? ' expanded' : '')}>
        <div>
          {this.state.isExpanded ? (
            <PostRecipients ref="selectFeeds"
              feeds={this.props.sendTo.feeds}
              defaultFeed={this.props.sendTo.defaultFeed}
              user={this.props.user}
              onChange={this.checkCreatePostAvailability}/>
          ) : false}

          <PostDropzone
            onAddedFile={handleAddedFile}
            onRemovedFile={handleRemovedFile}
            onUploadSuccess={handleUploadSuccess}/>

          <Textarea
            className="post-textarea"
            ref="postText"
            onFocus={this.expand}
            onKeyDown={this.checkSave}
            onChange={this.checkCreatePostAvailability}
            minRows={3}
            maxRows={10}
            maxLength="1500"/>
        </div>

        <div className="post-edit-options">
          <span className="post-edit-attachments dropzone-trigger">
            <i className="fa fa-cloud-upload"></i>
            {' '}
            Add photos or files
          </span>

          <a className="post-edit-more-trigger" onClick={this.toggleMore}>More&nbsp;&#x25be;</a>

          {this.state.isMoreOpen ? (
            <div className="post-edit-more">
              <label>
                <input
                  className="post-edit-more-checkbox"
                  type="checkbox"
                  ref="commentsDisabled"
                  defaultChecked={false}/>
                <span className="post-edit-more-labeltext">Comments disabled</span>
              </label>
            </div>
          ) : false}
        </div>

        <div className="post-edit-actions">
          {this.props.createPostForm.status === 'loading' ? (
            <span className="post-edit-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}

          <button className="btn btn-default btn-xs"
            onClick={preventDefault(this.submitForm)}
            disabled={this.state.isFormEmpty || this.state.attachmentQueueLength > 0 || this.props.createPostForm.status === 'loading'}>Post</button>
        </div>

        <PostAttachments
          attachments={this.props.createPostForm.attachments}
          isEditing={true}
          isExpanded={true}
          removeAttachment={this.removeAttachment}/>

        <div className="dropzone-previews"></div>

        {this.props.createPostForm.status === 'error' ? (
          <div className="alert alert-danger" role="alert">
            Post has not been saved. Server response: "{this.props.createPostForm.errorMessage}"
          </div>
        ) : false}
      </div>
    );
  }
}
