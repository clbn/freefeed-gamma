import React from 'react';
import { connect } from 'react-redux';
import Textarea from 'react-textarea-autosize';

import { addComment, updateHighlightedComments } from '../../redux/action-creators';
import Icon from './icon';
import Throbber from './throbber';
import { getDraftCA, setDraftCA } from '../../utils/drafts';

class CommentCreateForm extends React.Component {
  bindTextarea = (textarea) => {
    this._textarea = textarea;
    this.props.bindTextarea(this._textarea);
  };

  typedArrows = []; // Array of arrows (^^^) lengths, that user typing in the textarea

  startCommenting = () => {
    if (!this.props.post.isCommenting) {
      this.props.toggleCommenting();
    }
  };

  cancelCommenting = () => {
    if (!this._textarea.value || confirm('Discard changes and close the form?')) {
      this.props.toggleCommenting();
      this.props.updateHighlightedComments();
      this.typedArrows = [];
      setDraftCA(this.props.post.id, null);
    }
  };

  handleKeyDown = (event) => {
    const enterPressed = (event.keyCode === 13);
    const shiftPressed = event.shiftKey;
    if (enterPressed && !shiftPressed) {
      event.preventDefault();
      event.target.blur();
      setTimeout(this.saveComment, 0);
    }
  };

  handleChangeText = () => {
    const arrowsFound = this._textarea.value.match(/\^+/g);
    const arrows = (arrowsFound ? arrowsFound.map(a => a.length) : []);

    if (this.typedArrows.length !== arrows.length || !this.typedArrows.every((v, i) => (v === arrows[i]))) { // just comparing two arrays
      this.typedArrows = arrows;
      if (arrows.length > 0) {
        this.props.updateHighlightedComments({ reason: 'hover-arrows', postId: this.props.post.id, baseCommentId: null, arrows });
      } else {
        this.props.updateHighlightedComments();
      }
    }

    setDraftCA(this.props.post.id, this._textarea.value);
  };

  saveComment = () => {
    if (!this.props.post.isSavingComment) {
      this.props.addComment(this.props.post.id, this._textarea.value);
      this.props.updateHighlightedComments();
      this.typedArrows = [];
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
    const draft = getDraftCA(this.props.post.id);

    if (!writingComment && !singlePost && !draft && !manyComments) {
      return false;
    }

    return (
      <div className="comment">
        <a className="comment-icon comment-icon-add" onClick={this.startCommenting}>
          <Icon name="comment-plus"/>
        </a>

        {writingComment ? (
          <div className="comment-body">
            <Textarea
              inputRef={this.bindTextarea}
              className="form-control comment-textarea"
              defaultValue={draft ?? ''}
              autoFocus={true}
              onKeyDown={this.handleKeyDown}
              onChange={this.handleChangeText}
              minRows={2}
              maxRows={10}
              maxLength="1500"/>

            <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Comment</button>

            <a className="comment-cancel" onClick={this.cancelCommenting}>Cancel</a>

            {this.props.post.isSavingComment ? (
              <Throbber name="comment-edit"/>
            ) : this.props.post.commentError ? (
              <div className="comment-error alert alert-danger" role="alert">
                Comment has not been saved. Server response: "{this.props.post.commentError}"
              </div>
            ) : false}
          </div>
        ) : (singlePost || draft) ? (
          <div className="comment-body">
            <textarea
              className="form-control comment-textarea"
              rows={2}
              placeholder={draft}
              onFocus={this.startCommenting}/>
          </div>
        ) : <>
          <a className="add-comment-link" onClick={this.startCommenting}>Add comment</a>

          {this.props.post.commentsDisabled && this.props.post.canIModerate && (
            <i> - disabled for others</i>
          )}
        </>}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addComment: (...args) => dispatch(addComment(...args)),
    updateHighlightedComments: (...args) => dispatch(updateHighlightedComments(...args))
  };
}

export default connect(null, mapDispatchToProps)(CommentCreateForm);
