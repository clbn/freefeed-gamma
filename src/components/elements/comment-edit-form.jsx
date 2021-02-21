import React, { useCallback, useRef } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Textarea from 'react-textarea-autosize';

import Icon from './icon';
import Throbber from './throbber';
import { toggleEditingComment, saveEditingComment, updateHighlightedComments } from '../../redux/action-creators';
import { getDraftCU, setDraftCU } from '../../utils/drafts';
import { useUploader } from '../../utils/useUploader';
import { insertText } from '../../utils/insert-text';

const CommentEditForm = ({ id, postId, expandFn }) => {
  const body = useSelector(state => state.comments[id].body);
  const { isSaving, errorMessage } = useSelector(state => state.commentViews[id], shallowEqual);

  const dispatch = useDispatch();

  const textarea = useRef({}); // Textarea DOM element
  const typedArrows = useRef([]); // Array of arrows (^^^) lengths, that user typing in the textarea

  const toggleEditing = useCallback(() => {
    dispatch(toggleEditingComment(id));
    dispatch(updateHighlightedComments());
    typedArrows.current = [];
  }, [dispatch, id]);

  const cancelEditing = useCallback(() => {
    const isTextNotChanged = body === textarea.current.value.trim();
    if (isTextNotChanged || confirm('Discard changes and close the form?')) {
      toggleEditing();
      setDraftCU(id, null);
    }
  }, [body, id, toggleEditing]);

  const saveComment = useCallback(() => {
    if (!isSaving) {
      dispatch(saveEditingComment(id, textarea.current.value));

      dispatch(updateHighlightedComments());
      typedArrows.current = [];

      expandFn(true);
    }
  }, [dispatch, expandFn, id, isSaving]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      setTimeout(saveComment, 0);
    }
  }, [saveComment]);

  const handleKeyUp = useCallback((event) => {
    if (event.key === 'Escape') {
      cancelEditing();
    }
  }, [cancelEditing]);

  const handleChangeText = useCallback(() => {
    const arrowsFound = textarea.current.value.match(/\^+/g);
    const arrows = (arrowsFound ? arrowsFound.map(a => a.length) : []);

    if (typedArrows.current.length !== arrows.length || !typedArrows.current.every((v, i) => (v === arrows[i]))) { // just comparing two arrays
      typedArrows.current = arrows;
      if (arrows.length > 0) {
        dispatch(updateHighlightedComments({ reason: 'hover-arrows', postId: postId, baseCommentId: id, arrows }));
      } else {
        dispatch(updateHighlightedComments());
      }
    }

    const isTextChanged = body !== textarea.current.value.trim();
    setDraftCU(id, isTextChanged ? textarea.current.value : null);
  }, [dispatch, body, id, postId]);

  const draft = getDraftCU(id);

  const insertUrlAfterUpload = useCallback(attUrl => {
    insertText(textarea.current, attUrl);
    handleChangeText();
  }, [handleChangeText]);
  const { getDropzoneProps, getFileInputProps, openFileDialog, handlePaste, queueLength } = useUploader(insertUrlAfterUpload);

  const isSubmitButtonDisabled = queueLength > 0 || isSaving;

  return (
    <div className="comment-body" {...getDropzoneProps()}>
      <Textarea
        ref={textarea}
        className="form-control comment-textarea"
        defaultValue={draft ?? body}
        autoFocus={true}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onChange={handleChangeText}
        onPaste={handlePaste}
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
          {isSaving && (
            <Throbber name="comment-edit" size={14}/>
          )}

          <a className="comment-cancel" onClick={cancelEditing}>Cancel</a>

          <button className="btn btn-default btn-xs comment-post" onClick={saveComment} disabled={isSubmitButtonDisabled}>
            Save changes
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="comment-error alert alert-danger" role="alert">
          Comment has not been saved. Server response: "{errorMessage}"
        </div>
      )}
    </div>
  );
};

export default CommentEditForm;
