import React, { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import Textarea from 'react-textarea-autosize';

import { addComment, updateHighlightedComments } from '../../redux/action-creators';
import Icon from './icon';
import Throbber from './throbber';
import { getDraftCA, setDraftCA } from '../../utils/drafts';
import { useUploader } from '../../utils/useUploader';

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

  const appendUrlAfterUpload = useCallback(attUrl => {
    const text = textarea.current.value;
    const addSpace = text.length && !text.match(/\s$/);
    textarea.current.value = `${text}${addSpace ? ' ' : ''}${attUrl} `;
    textarea.current.focus();
    handleChangeText();
  }, [handleChangeText]);
  const { getDropzoneProps, getFileInputProps, openFileDialog, queueLength } = useUploader(appendUrlAfterUpload);

  const isSubmitButtonDisabled = queueLength > 0 || post.isSavingComment;

  if (!post.isCommenting && !isSinglePost && !draft && !needsAddCommentLink) {
    return false;
  }

  return (
    <div className="comment">
      <a className="comment-icon comment-icon-add" onClick={startCommenting}>
        <Icon name="comment-plus"/>
      </a>

      {post.isCommenting ? (
        <div className="comment-body" {...getDropzoneProps()}>
          <Textarea
            ref={textareaCallbackRef}
            className="form-control comment-textarea"
            defaultValue={draft ?? ''}
            autoFocus={true}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onChange={handleChangeText}
            minRows={2}
            maxRows={10}
            maxLength="1500"/>

          <div className="comment-edit-actions">
            <div className="comment-attachments" onClick={openFileDialog}>
              <input {...getFileInputProps()}/>
              <Icon name="cloud-upload"/>{' '}
              <span>Add photos or files</span>
              {queueLength > 0 && (
                <span className="comment-attachments-uploading">
                  <Throbber name="comment-attachment" size={12}/>
                  {queueLength > 1 && queueLength}
                </span>
              )}
            </div>

            <div>
              {post.isSavingComment && (
                <Throbber name="comment-edit" size={14}/>
              )}

              <a className="comment-cancel" onClick={cancelCommenting}>Cancel</a>

              <button className="btn btn-default btn-xs comment-post" onClick={saveComment} disabled={isSubmitButtonDisabled}>
                Comment
              </button>
            </div>
          </div>

          {post.commentError && (
            <div className="comment-error alert alert-danger" role="alert">
              Comment has not been saved. Server response: "{post.commentError}"
            </div>
          )}
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
