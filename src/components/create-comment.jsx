import React from 'react';
import Textarea from 'react-textarea-autosize';

import throbber16 from 'assets/images/throbber-16.gif';

export default class CreateComment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editText: this.props.post.newCommentText || ''
    };
  }

  handleChange = (event) => {
    this.setState({
      editText: event.target.value
    });
  }

  setCaretToTextEnd = (event) => {
    const input = event.target;

    setTimeout(() => {
      if (typeof input.selectionStart === 'number') {
        input.selectionStart = input.selectionEnd = input.value.length;
      } else if (input.createTextRange !== undefined) {
        input.focus();
        const range = input.createTextRange();
        range.collapse(false);
        range.select();
      }
    }, 0);
  }

  updateCommentingText = () => {
    if (this.props.updateCommentingText) {
      this.props.updateCommentingText(this.props.post.id, this.refs.commentText.value);
    }
  }

  checkSave = (event) => {
    const isEnter = event.keyCode === 13;
    const isShiftPressed = event.shiftKey;
    if (isEnter && !isShiftPressed) {
      event.preventDefault();
      event.target.blur();
      setTimeout(this.saveComment, 0);
    }
  }

  saveComment = () => {
    if (!this.props.post.isSavingComment) {
      this.props.saveEditingComment(this.props.post.id, this.refs.commentText.value);
    }
  }

  componentWillReceiveProps(newProps) {
    // If it was successful saving, clear the form
    const isSavingFinished = this.props.post.isSavingComment && !newProps.post.isSavingComment;
    const isSavingFailed = newProps.post.commentError;
    if (isSavingFinished && !isSavingFailed) {
      this.setState({editText: ''});
    }

    // If it was updated from outside, update the form
    if (this.props.post.newCommentText !== newProps.post.newCommentText) {
      this.setState({editText: newProps.post.newCommentText});
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.post.isCommenting && this.props.post.newCommentText !== prevProps.post.newCommentText) {
      this.refs.commentText.focus();
    }
  }

  render() {
    const showLink = this.props.otherCommentsNumber > 2 && !this.props.post.omittedComments /* TODO: && user_is_signed_in */;
    const showForm = this.props.post.isCommenting;

    if (!showLink && !showForm) {
      return false;
    }

    return (
      <div className="comment">
        <a className="comment-icon fa-stack fa-1x" onClick={this.props.toggleCommenting}>
          <i className="fa fa-comment-o fa-stack-1x"></i>
          <i className="fa fa-square fa-inverse fa-stack-1x"></i>
          <i className="fa fa-plus fa-stack-1x"></i>
        </a>

        {showForm ? (
          <div className="comment-body">
            <div>
              <Textarea
                ref="commentText"
                className="comment-textarea"
                value={this.state.editText}
                autoFocus={!this.props.post.isSinglePost}
                onFocus={this.setCaretToTextEnd}
                onChange={this.handleChange}
                onKeyDown={this.checkSave}
                onBlur={this.updateCommentingText}
                style={{ overflow: 'hidden', wordWrap: 'break-word' }}
                minRows={2}
                maxRows={10}
                maxLength="1500"/>
            </div>

            {this.props.post.isSinglePost ? (
              <span>
                <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Comment</button>
              </span>
            ) : (
              <span>
                <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Post</button>
                <a className="comment-cancel" onClick={this.props.toggleCommenting}>Cancel</a>
              </span>
            )}

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
