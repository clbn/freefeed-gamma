import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import classnames from 'classnames';

import { makeGetComment } from '../../redux/selectors';
import PieceOfText from './piece-of-text';
import UserName from './user-name';
import CommentLikes from './comment-likes';
import CommentMoreMenu from './comment-more-menu';
import Icon from './icon';
import Throbber from './throbber';
import { preventDefault, confirmFirst, getISODate, getFullDate, getRelativeDate } from '../../utils';
import { toggleEditingComment, saveEditingComment, updateHighlightedComments, deleteComment } from '../../redux/action-creators';
import * as CommentTypes from '../../utils/comment-types';
import ARCHIVE_WATERSHED_TIMESTAMP from '../../utils/archive-timestamps';
import { getDraftCU, setDraftCU } from '../../utils/drafts';

const Comment = ({ id, postId, postUrl, isModeratingComments, openAnsweringComment }) => {
  const getComment = useMemo(makeGetComment, []);
  const {
    body, createdBy, createdAt, hideType, // data from store.comments
    isEditing, isSaving, isHighlighted, errorMessage, // data from store.commentViews
    authorUsername, canIEdit, amISubscribedToAuthor, isTargeted, notFound // derived data
  } = useSelector(state => getComment(state, id), shallowEqual);

  const dispatch = useDispatch();

  const [isExpanded, setExpanded] = useState(false);

  const commentContainerRef = useRef({});
  const commentTextRef = useRef({});

  const typedArrows = useRef([]); // Array of arrows (^^^) lengths, that user typing in the textarea

  const toggleEditing = useCallback(() => {
    dispatch(toggleEditingComment(id));
    dispatch(updateHighlightedComments());
    typedArrows.current = [];
  }, [dispatch, id]);

  const cancelEditing = useCallback(() => {
    const isTextNotChanged = body === commentTextRef.current.value.trim();
    if (isTextNotChanged || confirm('Discard changes and close the form?')) {
      toggleEditing();
      setDraftCU(id, null);
    }
  }, [body, id, toggleEditing]);

  const saveComment = useCallback(() => {
    if (!isSaving) {
      dispatch(saveEditingComment(id, commentTextRef.current.value));

      dispatch(updateHighlightedComments());
      typedArrows.current = [];

      setExpanded(true);
    }
  }, [dispatch, id, isSaving]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deleteAfterConfirmation = useCallback(confirmFirst(() => dispatch(deleteComment(id))), [dispatch, id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleIconClick = useCallback(preventDefault(() => {
    if (openAnsweringComment) {
      openAnsweringComment(authorUsername);
    }
  }), [openAnsweringComment, authorUsername]);

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
    const arrowsFound = commentTextRef.current.value.match(/\^+/g);
    const arrows = (arrowsFound ? arrowsFound.map(a => a.length) : []);

    if (typedArrows.current.length !== arrows.length || !typedArrows.current.every((v, i) => (v === arrows[i]))) { // just comparing two arrays
      typedArrows.current = arrows;
      if (arrows.length > 0) {
        dispatch(updateHighlightedComments({ reason: 'hover-arrows', postId: postId, baseCommentId: id, arrows }));
      } else {
        dispatch(updateHighlightedComments());
      }
    }

    const isTextChanged = body !== commentTextRef.current.value.trim();
    setDraftCU(id, isTextChanged ? commentTextRef.current.value : null);
  }, [dispatch, body, id, postId]);

  const userHoverHandlers = useMemo(() => ({
    hover: (username) => dispatch(updateHighlightedComments({ reason: 'hover-author', postId: postId, username })),
    leave: () => dispatch(updateHighlightedComments())
  }), [dispatch, postId]);

  const arrowHoverHandlers = useMemo(() => ({
    click: (arrows) => dispatch(updateHighlightedComments({ reason: 'click-arrows', postId: postId, baseCommentId: id, arrows })),
    hover: (arrows) => dispatch(updateHighlightedComments({ reason: 'hover-arrows', postId: postId, baseCommentId: id, arrows })),
    leave: () => dispatch(updateHighlightedComments())
  }), [dispatch, id, postId]);

  const getCommentPlaceholder = useCallback(() => {
    switch (hideType) {
      case CommentTypes.COMMENT_HIDDEN_BANNED: return 'Comment from banned';
      case CommentTypes.COMMENT_HIDDEN_ARCHIVED: return 'Comment in archive';
    }
    return body;
  }, [body, hideType]);

  useEffect(() => {
    if (isTargeted && commentContainerRef.current) {
      const rect = commentContainerRef.current.getBoundingClientRect();
      const middleScreenPosition = window.pageYOffset + ((rect.top + rect.bottom) / 2) - (window.innerHeight / 2);
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        window.scrollTo(0, middleScreenPosition);
      }
    }
  }, [isTargeted]);

  if (notFound) {
    return false;
  }

  const commentClasses = classnames({
    'comment': true,
    'comment-from-archive': (+createdAt < ARCHIVE_WATERSHED_TIMESTAMP),
    'hidden-comment': !!hideType,
    'highlighted': isHighlighted,
    'targeted-comment': isTargeted
  });

  const iconClasses = classnames({
    'comment-icon': true,
    'comment-icon-important': amISubscribedToAuthor,
    'comment-icon-mine': canIEdit,
  });

  const dateISO = getISODate(+createdAt);
  const dateFull = getFullDate(+createdAt);
  const dateRelative = getRelativeDate(+createdAt);
  const dateRelativeShort = getRelativeDate(+createdAt, false);

  // "Changes not saved" when there is a draft
  const draft = getDraftCU(id);
  const draftLink = (draft && (draft !== body) ? <>
    {' -'}&nbsp;
    <a onClick={toggleEditing} title={`Click to review your changes:\n\n${draft}`}>
      <i className="alert-warning">Changes not saved</i>
    </a>
  </> : false);

  return (
    <div className={commentClasses} id={`comment-${id}`} ref={commentContainerRef}>
      <a className={iconClasses}
        title={dateRelative + '\n' + dateFull}
        href={`${postUrl}#comment-${id}`}
        onClick={handleIconClick}>

        <Icon name="comment"/>
      </a>

      {hideType ? (
        <div className="comment-body">
          {getCommentPlaceholder()}

          {dateRelativeShort ? (
            <span className="comment-timestamp">
              {' - '}
              <Link to={`${postUrl}#comment-${id}`} dir="auto">
                <time dateTime={dateISO} title={dateFull}>{dateRelativeShort}</time>
              </Link>
            </span>
          ) : false}
        </div>
      ) : isEditing ? (
        <div className="comment-body">
          <Textarea
            ref={commentTextRef}
            className="form-control comment-textarea"
            defaultValue={draft ?? body}
            autoFocus={true}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onChange={handleChangeText}
            minRows={2}
            maxRows={10}
            maxLength="1500"/>

          <button className="btn btn-default btn-xs comment-post" onClick={saveComment}>Post</button>

          <a className="comment-cancel" onClick={cancelEditing}>Cancel</a>

          {isSaving ? (
            <Throbber name="comment-edit"/>
          ) : errorMessage ? (
            <div className="comment-error alert alert-danger" role="alert">
              Comment has not been saved. Server response: "{errorMessage}"
            </div>
          ) : false}
        </div>
      ) : (
        <div className="comment-body">
          <PieceOfText
            text={body}
            isExpanded={isExpanded}
            userHover={userHoverHandlers}
            arrowHover={arrowHoverHandlers}/>

          {draftLink}

          {' -'}&nbsp;

          <UserName id={createdBy}/>

          {' '}

          {dateRelativeShort ? (
            <span className="comment-timestamp">
              {'-\u00a0'}
              <Link to={`${postUrl}#comment-${id}`} dir="auto">
                <time dateTime={dateISO} title={dateFull}>{dateRelativeShort}</time>
              </Link>
            </span>
          ) : false}

          {' '}

          <CommentLikes commentId={id}/>

          <CommentMoreMenu
            isCommentMine={canIEdit} isModeratingComments={isModeratingComments}
            editFn={toggleEditing} deleteFn={deleteAfterConfirmation}/>
        </div>
      )}
    </div>
  );
};

export default Comment;
