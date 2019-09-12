import React from 'react';
import { connect } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import _ from 'lodash';

import PostRecipients from './post-recipients';
import PostDropzone from './post-dropzone';
import PostVisibilityIcon from './post-visibility-icon';
import PostAttachments from './post-attachments';
import Icon from './icon';
import Throbber from './throbber';
import * as PostVisibilityLevels from '../../utils/post-visibility-levels';
import { preventDefault, getPostVisibilityLevel } from '../../utils';
import { createPost, resetPostCreateForm, addAttachmentResponse, removeAttachment } from '../../redux/action-creators';

class PostCreateForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recipients: props.defaultRecipients.map(username => ({ username })),
      isExpanded: props.hasRecipientInUrl,
      isFormEmpty: true,
      isMoreOpen: false,
      transientAttachments: (props.createPostForm.attachments || []).map(id => props.attachments[id]), // for attachments during editing process, before the changes are permanent
      hasUploadFailed: false,
      attachmentQueueLength: 0
    };
  }

  //
  // Refs

  refPostText = (input) => { this.postText = input; };
  refCommentsDisabled = (input) => { this.commentsDisabled = input; };

  //
  // Expanding and collapsing

  expand = () => {
    if (!this.state.isExpanded) {
      this.setState({ isExpanded: true });
    }
  };

  toggleMore = () => {
    this.setState({ isMoreOpen: !this.state.isMoreOpen });
  };

  //
  // Handling attachments

  handleDropzoneInit = (d) => {
    this.dropzoneObject = d;
  };
  handleAddedFile = () => {
    this.setState({ attachmentQueueLength: this.state.attachmentQueueLength + 1 });
  };
  handleRemovedFile = () => {
    if (this.state.attachmentQueueLength === 1) {
      this.setState({ hasUploadFailed: false });
    }
    this.setState({ attachmentQueueLength: this.state.attachmentQueueLength - 1 });
  };
  handleUploadSuccess = (attachment) => (
    this.props.addAttachmentResponse(null, attachment)
  );
  handleUploadFailure = () => {
    this.setState({ hasUploadFailed: true });
  };

  handlePaste = (e) => {
    if (e.clipboardData) {
      const items = e.clipboardData.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image/') > -1) {
            const blob = items[i].getAsFile();
            if (!blob.name) {
              blob.name = 'image.png';
            }
            this.dropzoneObject.addFile(blob);
          }
        }
      }
    }
  };

  getTransientAttachments = () => {
    // Without pre-sorting, indexes of sortable images might be different from their apparent positions.
    //
    // For example: for [image, image, audio, audio, image], a user won't be able to move the last image,
    // because Sortable will move item with index 2, while the component that operates with all the attachments
    // will move the first audio for that index.
    //
    // With pre-sorting transientAttachments, we make sure that "global" and "local" image indexes are the same.

    const mt = { image: 0, audio: 1, general: 2 };
    return _.sortBy(this.state.transientAttachments, (a) => mt[a.mediaType]);
  };

  updateAttachments = (attachments) => {
    this.setState({
      transientAttachments: attachments
    });
  };

  //
  // Handling recipients, text typing and posting

  handleRecipientsUpdate = (recipients) => {
    this.setState({ recipients });
    setTimeout(this.updateEmptinessState, 0);
  };

  updateEmptinessState = () => {
    let isFormEmpty = this.isPostTextEmpty() || this.state.recipients.length === 0;

    if (isFormEmpty !== this.state.isFormEmpty) {
      this.setState({ isFormEmpty });
    }
  };

  isPostTextEmpty = () => (!this.postText || this.postText.value === '' || /^\s+$/.test(this.postText.value));

  getSubmitButtonText(recipients) {
    // If visibility level is direct OR it's empty list on "Direct messages" page, then "Send", otherwise "Post"
    const submitAction = (getPostVisibilityLevel(recipients, this.props.me.id) === PostVisibilityLevels.DIRECT ||
      (recipients.length === 0 && this.props.defaultRecipient === null) ? 'Send' : 'Post');

    const getRecipientName = (r) => (r.username === this.props.me.username ? <b>my feed</b> : <b>@{r.username}</b>);
    const recNames = recipients.map(getRecipientName);

    switch (recNames.length) {
      case 0: return <>{submitAction} <i>(recipient missing)</i></>;
      case 1: return <>{submitAction} to {recNames[0]}</>;
      case 2: return <>{submitAction} to {recNames[0]} and {recNames[1]}</>;
      case 3: return <>{submitAction} to {recNames[0]}, {recNames[1]} and {recNames[2]}</>;
      default:
        const firstTwo = recNames.slice(0, 2);
        const remainder = recNames.length - 2;
        return <>{submitAction} to {firstTwo[0]}, {firstTwo[1]} and {remainder} more</>;
    }
  }

  checkIfEnterPressed = (e) => {
    const isEnter = e.keyCode === 13;
    const isShiftPressed = e.shiftKey;
    if (isEnter && !isShiftPressed) {
      e.preventDefault();
      if (!this.state.isFormEmpty && this.state.attachmentQueueLength === 0 && this.props.createPostForm.status !== 'loading') {
        this.submitForm();
      }
    }
  };

  submitForm = () => {
    // Get all the values
    const feeds = this.state.recipients.map(r => r.username);
    const postText = this.postText.value;
    const attachmentIds = this.getTransientAttachments().map(item => item.id);
    const more = {
      commentsDisabled: (this.commentsDisabled && this.commentsDisabled.checked)
    };

    // Send to the server
    this.props.createPost(feeds, postText, attachmentIds, more);
  };

  cancelCreatingPost = () => {
    if (this.isPostTextEmpty() || confirm('Discard changes and close the form?')) {
      this.resetForm();
    }
  };

  resetForm = (keepExpanded = false) => {
    this.postText.value = '';
    setTimeout(() => document.activeElement.blur(), 0);

    const attachmentIds = this.props.createPostForm.attachments || [];
    attachmentIds.forEach(id => this.props.removeAttachment(null, id));

    this.setState({
      recipients: this.props.defaultRecipients.map(username => ({ username })),
      isExpanded: keepExpanded,
      isFormEmpty: true,
      isMoreOpen: false,
      transientAttachments: [],
      hasUploadFailed: false,
      attachmentQueueLength: 0
    });
  };

  //
  // Component lifecycle

  componentDidMount() {
    if (this.props.hasRecipientInUrl) {
      setTimeout(() => this.postText.focus(), 0);
    }
  }

  componentDidUpdate(prevProps) {
    // If it was successful saving, clear the form
    if (prevProps.createPostForm.status === 'loading' && this.props.createPostForm.status === 'success') {
      this.resetForm(this.props.hasRecipientInUrl);
    }

    if (!_.isEqual(prevProps.defaultRecipients, this.props.defaultRecipients)) {
      this.resetForm(this.props.hasRecipientInUrl);
      if (this.props.hasRecipientInUrl) {
        setTimeout(() => this.postText.focus(), 0);
      }
    }

    // Sync attachment edits when adding items
    // (Because adding goes through Redux store now. TODO: make it work via local state as reorder/remove does.)
    if ((prevProps.createPostForm.attachments !== this.props.createPostForm.attachments) && this.state.isExpanded) {
      const addedAttachments = _.difference(this.props.createPostForm.attachments, prevProps.createPostForm.attachments)
        .map(id => this.props.attachments[id]);
      const newAttachments = this.getTransientAttachments().concat(addedAttachments) || [];
      this.setState({
        transientAttachments: newAttachments
      });
    }
  }

  componentWillUnmount() {
    this.props.resetPostCreateForm();
  }

  //
  // Render

  render() {
    const isSubmitButtonDisabled = this.state.isFormEmpty || this.state.attachmentQueueLength > 0 || this.props.createPostForm.status === 'loading';
    const submitButtonText = this.getSubmitButtonText(this.state.recipients);

    return (
      <div className={'create-post post-editor' + (this.state.isExpanded ? ' expanded' : '')}>
        {this.state.isExpanded ? (
          <PostRecipients
            selected={this.state.recipients}
            peopleFirst={this.props.peopleFirst}
            onChange={this.handleRecipientsUpdate}/>
        ) : false}

        <PostDropzone
          onInit={this.handleDropzoneInit}
          onAddedFile={this.handleAddedFile}
          onRemovedFile={this.handleRemovedFile}
          onUploadSuccess={this.handleUploadSuccess}
          onUploadFailure={this.handleUploadFailure}/>

        <Textarea
          className="form-control post-textarea"
          inputRef={this.refPostText}
          onFocus={this.expand}
          onKeyDown={this.checkIfEnterPressed}
          onChange={this.updateEmptinessState}
          onPaste={this.handlePaste}
          minRows={3}
          maxRows={10}
          maxLength="1500"/>

        <div className="post-edit-options">
          <span className="post-edit-attachments dropzone-trigger">
            <Icon name="cloud-upload"/>
            {' '}
            <span className="xs-screen">Upload</span>
            <span className="other-screens">Add photos or files</span>
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
          {this.props.createPostForm.status === 'loading' && (
            <Throbber name="post-edit"/>
          )}

          <a className="post-cancel" onClick={this.cancelCreatingPost}>Cancel</a>

          <button className="btn btn-default btn-xs" onClick={preventDefault(this.submitForm)} disabled={isSubmitButtonDisabled}>
            {submitButtonText}
          </button>

          <PostVisibilityIcon recipients={this.state.recipients} authorId={this.props.me.id}/>
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
          attachments={this.getTransientAttachments()}
          isEditing={true}
          update={this.updateAttachments}/>

        <div className="dropzone-previews"></div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  createPostForm: state.createPostForm,
  attachments: state.attachments,
  me: state.me,
  hasRecipientInUrl: !!state.routing.locationBeforeTransitions.query.to
});

const mapDispatchToProps = {
  createPost,
  resetPostCreateForm,
  addAttachmentResponse,
  removeAttachment
};

export default connect(mapStateToProps, mapDispatchToProps)(PostCreateForm);
