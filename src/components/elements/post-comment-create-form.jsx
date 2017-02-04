import React from 'react';
import Textarea from 'react-textarea-autosize';

import throbber16 from 'assets/images/throbber-16.gif';

export default class PostCommentCreateForm extends React.Component {
  bindTextarea = (textarea) => {
    this._textarea = textarea;
    this.props.bindTextarea(this._textarea);
  };

  cancelCommenting = () => {
    if (!this._textarea.value) {
      this.props.toggleCommenting();
    } else if (confirm('Discard changes and close the form?')) {
      this.props.toggleCommenting();
    }
  };

  checkSave = (event) => {
    const isEnter = event.keyCode === 13;
    const isShiftPressed = event.shiftKey;
    if (isEnter && !isShiftPressed) {
      event.preventDefault();
      event.target.blur();
      setTimeout(this.saveComment, 0);
    }
  };

  saveComment = () => {
    if (!this.props.post.isSavingComment) {
      this.props.saveEditingComment(this.props.post.id, this._textarea.value);
    }
  };

  componentWillReceiveProps(newProps) {
    // If it was successful saving, clear the form
    const isSavingFinished = this.props.post.isSavingComment && !newProps.post.isSavingComment;
    const isSavingFailed = newProps.post.commentError;
    if (isSavingFinished && !isSavingFailed) {
      this._textarea.value = '';
    }
  }

  render() {
    const writingComment = this.props.post.isCommenting;
    const singlePost = this.props.isSinglePost;
    const manyComments = this.props.otherCommentsNumber > 2 && !this.props.post.omittedComments /* TODO: && user_is_signed_in */;

    if (!writingComment && !singlePost && !manyComments) {
      return false;
    }

    return (
      <div className="comment">
        <a className="comment-icon comment-icon-add fa-stack" onClick={this.props.toggleCommenting}>
          <i className="fa fa-comment-o fa-stack-1x"></i>
          <i className="fa fa-square fa-inverse fa-stack-1x"></i>
          <i className="fa fa-plus fa-stack-1x"></i>
        </a>

        {writingComment ? (
          <div className="comment-body">
            <div>
              <Textarea
                ref={this.bindTextarea}
                className="form-control comment-textarea"
                defaultValue=""
                autoFocus={true}
                onKeyDown={this.checkSave}
                minRows={2}
                maxRows={10}
                maxLength="1500"/>
            </div>

            <span>
              <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Comment</button>
              <a className="comment-cancel" onClick={this.cancelCommenting}>Cancel</a>
            </span>

            {this.props.post.isSavingComment ? (
              <span className="comment-throbber">
                <img width="16" height="16" src={throbber16}/>
              </span>
            ) : this.props.post.commentError ? (
              <div className="comment-error alert alert-danger" role="alert">
                Comment has not been saved. Server response: "{this.props.post.commentError}"
              </div>
            ) : false}
          </div>
        ) : singlePost ? (
          <div className="comment-body">
            <Textarea
              className="form-control comment-textarea"
              rows={2}
              defaultValue=""
              onFocus={this.props.toggleCommenting}/>
          </div>
        ) : (
          <div>
            <a className="add-comment-link" onClick={this.props.toggleCommenting}>Add comment</a>
            {this.props.post.commentsDisabled && this.props.post.isEditable
              ? <i> - disabled for others</i>
              : false}
          </div>
        )}
      </div>
    );
  }
}
