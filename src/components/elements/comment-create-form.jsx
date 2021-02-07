import React, { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import Textarea from 'react-textarea-autosize';

import { addComment, updateHighlightedComments } from '../../redux/action-creators';
import Icon from './icon';
import Throbber from './throbber';
import { getDraftCA, setDraftCA } from '../../utils/drafts';

const CommentCreateForm = ({ post, isSinglePost, otherCommentsNumber, toggleCommenting, bindTextarea }) => {
  const dispatch = useDispatch();

  const textarea = useRef({}); // Textarea DOM element
  const typedArrows = useRef([]); // Array of arrows (^^^) lengths, that user typing in the textarea

  const textareaCallbackRef = useCallback(textareaElement => {
    textarea.current = textareaElement;
    bindTextarea(textareaElement);
  }, [bindTextarea]);

  const startCommenting = useCallback(() => {
    if (!post.isCommenting) {
      toggleCommenting();
    }
  }, [post.isCommenting, toggleCommenting]);

  const cancelCommenting = useCallback(() => {
    if (!textarea.current.value || confirm('Discard changes and close the form?')) {
      toggleCommenting();
      dispatch(updateHighlightedComments());
      typedArrows.current = [];
      setDraftCA(post.id, null);
    }
  }, [dispatch, post.id, toggleCommenting]);

  const saveComment = useCallback(() => {
    if (!post.isSavingComment) {
      dispatch(addComment(post.id, textarea.current.value));
      dispatch(updateHighlightedComments());
      typedArrows.current = [];
    }
  }, [dispatch, post.id, post.isSavingComment]);

  const handleKeyDown = useCallback(event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      setTimeout(saveComment, 0);
    }
  }, [saveComment]);

  const handleKeyUp = useCallback(event => {
    if (event.key === 'Escape') {
      cancelCommenting();
    }
  }, [cancelCommenting]);

  const handleChangeText = useCallback(() => {
    const arrowsFound = textarea.current.value.match(/\^+/g);
    const arrows = (arrowsFound ? arrowsFound.map(a => a.length) : []);

    if (typedArrows.current.length !== arrows.length || !typedArrows.current.every((v, i) => (v === arrows[i]))) { // just comparing two arrays
      typedArrows.current = arrows;
      if (arrows.length > 0) {
        dispatch(updateHighlightedComments({ reason: 'hover-arrows', postId: post.id, baseCommentId: null, arrows }));
      } else {
        dispatch(updateHighlightedComments());
      }
    }

    setDraftCA(post.id, textarea.current.value);
  }, [dispatch, post.id]);

  const needsAddCommentLink = otherCommentsNumber > 2 && !post.omittedComments;
  const draft = getDraftCA(post.id);

  if (!post.isCommenting && !isSinglePost && !draft && !needsAddCommentLink) {
    return false;
  }

  return (
    <div className="comment">
      <a className="comment-icon comment-icon-add" onClick={startCommenting}>
        <Icon name="comment-plus"/>
      </a>

      {post.isCommenting ? (
        <div className="comment-body">
          <Textarea
            inputRef={textareaCallbackRef}
            className="form-control comment-textarea"
            defaultValue={draft ?? ''}
            autoFocus={true}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onChange={handleChangeText}
            minRows={2}
            maxRows={10}
            maxLength="1500"/>

          <button className="btn btn-default btn-xs comment-post" onClick={saveComment}>Comment</button>

          <a className="comment-cancel" onClick={cancelCommenting}>Cancel</a>

          {post.isSavingComment ? (
            <Throbber name="comment-edit"/>
          ) : post.commentError ? (
            <div className="comment-error alert alert-danger" role="alert">
              Comment has not been saved. Server response: "{post.commentError}"
            </div>
          ) : false}
        </div>
      ) : (isSinglePost || draft) ? (
        <div className="comment-body">
          <textarea
            className="form-control comment-textarea"
            rows={2}
            placeholder={draft}
            onFocus={startCommenting}/>
        </div>
      ) : <>
        <a className="add-comment-link" onClick={startCommenting}>Add comment</a>

        {post.commentsDisabled && post.canIModerate && (
          <i> - disabled for others</i>
        )}
      </>}
    </div>
  );
};

export default CommentCreateForm;
