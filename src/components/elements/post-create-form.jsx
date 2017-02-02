import React from 'react';
import { connect } from 'react-redux';
import Textarea from 'react-textarea-autosize';

import PostRecipients from './post-recipients';
import PostDropzone from './post-dropzone';
import PostAttachments from './post-attachments';
import { preventDefault } from '../../utils';
import throbber16 from 'assets/images/throbber-16.gif';

class PostCreateForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: !!props.recipientFromUrl,
      defaultFeed: props.recipientFromUrl || props.sendTo.defaultFeed,
      isFormEmpty: true,
      isMoreOpen: false,
      hasUploadFailed: false,
      attachmentQueueLength: 0
    };
  }

  refPostRecipients = (input) => { this.postRecipients = input; };
  refPostText = (input) => { this.postText = input; };
  refCommentsDisabled = (input) => { this.commentsDisabled = input; };

  expand = () => {
    if (!this.state.isExpanded) {
      this.setState({ isExpanded: true });
    }
  };

  toggleMore = () => {
    this.setState({ isMoreOpen: !this.state.isMoreOpen });
  };

  cancelCreatingPost = () => {
    if (this.state.isFormEmpty) {
      this.clearForm();
    } else if (confirm('Discard changes and close the form?')) {
      this.clearForm();
    }
  };

  submitForm = () => {
    // Get all the values
    const feeds = this.postRecipients.values;
    const postText = this.postText.value;
    const attachmentIds = this.props.createPostForm.attachments.map(attachment => attachment.id);
    const more = {
      commentsDisabled: (this.commentsDisabled && this.commentsDisabled.checked)
    };

    // Send to the server
    this.props.createPost(feeds, postText, attachmentIds, more);
  };

  clearForm = () => {
    this.postText.value = '';
    setTimeout(() => document.activeElement.blur(), 0);

    this.setState({
      isExpanded: false,
      isFormEmpty: true,
      isMoreOpen: false,
      hasUploadFailed: false,
      attachmentQueueLength: 0
    });

    const attachmentIds = this.props.createPostForm.attachments.map(attachment => attachment.id);
    attachmentIds.forEach(this.removeAttachment);
  };

  removeAttachment = (attachmentId) => this.props.removeAttachment(null, attachmentId);

  isPostTextEmpty = (postText) => {
    return postText == '' || /^\s+$/.test(postText);
  };

  checkCreatePostAvailability = () => {
    let isFormEmpty = this.isPostTextEmpty(this.postText.value) || this.postRecipients.values == 0;

    this.setState({
      isFormEmpty
    });
  };

  checkSave = (e) => {
    const isEnter = e.keyCode === 13;
    const isShiftPressed = e.shiftKey;
    if (isEnter && !isShiftPressed) {
      e.preventDefault();
      if (!this.state.isFormEmpty && this.state.attachmentQueueLength === 0 && this.props.createPostForm.status !== 'loading') {
        this.submitForm();
      }
    }
  };

  componentDidMount() {
    if (this.props.recipientFromUrl) {
      setTimeout(() => this.postText.focus(), 0);
    }
  }

  componentWillReceiveProps(newProps) {
    // If defaultFeed gets updated, it means the transition between Direct messages
    // and Discussions pages happened (they share the top component, so PostCreateForm
    // doesn't get unmounted/mounted in the process). That's one "hacky" way to check
    // for this transition without passing another prop from discussions.jsx
    if (newProps.sendTo.defaultFeed !== this.props.sendTo.defaultFeed) {
      this.clearForm();
    }

    // If recipientFromUrl gets updated, focus the form again
    // (this happens when the component is already rendered, but not expanded,
    // and then we got a new recipientFromUrl - e.g., when user clicks from
    // UserCard while on Direct messages or Discussions page)
    if (newProps.recipientFromUrl && newProps.recipientFromUrl !== this.props.recipientFromUrl) {
      this.setState({
        isExpanded: true
      });
      setTimeout(() => this.postText.focus(), 0);
    }

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
      this.setState({ attachmentQueueLength: this.state.attachmentQueueLength + 1 });
    };
    const handleRemovedFile = () => {
      if (this.state.attachmentQueueLength === 1) {
        this.setState({ hasUploadFailed: false });
      }
      this.setState({ attachmentQueueLength: this.state.attachmentQueueLength - 1 });
    };
    const handleUploadSuccess = (attachment) => (
      this.props.addAttachmentResponse(null, attachment)
    );
    const handleUploadFailure = () => {
      this.setState({ hasUploadFailed: true });
    };

    const defaultFeed = this.props.recipientFromUrl || this.props.sendTo.defaultFeed;

    return (
      <div className={'create-post post-editor' + (this.state.isExpanded ? ' expanded' : '')}>
        <div>
          {this.state.isExpanded ? (
            <PostRecipients ref={this.refPostRecipients}
              feeds={this.props.sendTo.feeds}
              defaultFeed={defaultFeed}
              user={this.props.user}
              onChange={this.checkCreatePostAvailability}/>
          ) : false}

          <PostDropzone
            onAddedFile={handleAddedFile}
            onRemovedFile={handleRemovedFile}
            onUploadSuccess={handleUploadSuccess}
            onUploadFailure={handleUploadFailure}/>

          <Textarea
            className="form-control post-textarea"
            ref={this.refPostText}
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
                  ref={this.refCommentsDisabled}
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

          <a className="post-cancel" onClick={this.cancelCreatingPost}>Cancel</a>

          <button className="btn btn-default btn-xs"
            onClick={preventDefault(this.submitForm)}
            disabled={this.state.isFormEmpty || this.state.attachmentQueueLength > 0 || this.props.createPostForm.status === 'loading'}>Post</button>
        </div>

        {this.state.hasUploadFailed ? (
          <div className="post-error alert alert-warning" role="alert">
            Some files have failed to upload. You'll need to remove them from the queue to submit the post.
          </div>
        ) : false}

        {this.props.createPostForm.status === 'error' ? (
          <div className="post-error alert alert-danger" role="alert">
            Post has not been saved. Server response: "{this.props.createPostForm.errorMessage}"
          </div>
        ) : false}

        <PostAttachments
          attachments={this.props.createPostForm.attachments}
          isEditing={true}
          isExpanded={true}
          removeAttachment={this.removeAttachment}/>

        <div className="dropzone-previews"></div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    recipientFromUrl: state.routing.locationBeforeTransitions.query.to
  };
};

export default connect(mapStateToProps)(PostCreateForm);
