import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classnames from 'classnames';

import { makeGetComment } from '../../redux/selectors';
import PieceOfText from './piece-of-text';
import UserName from './user-name';
import CommentLikes from './comment-likes';
import CommentMoreMenu from './comment-more-menu';
import CommentEditForm from './comment-edit-form';
import Icon from './icon';
import { preventDefault, confirmFirst, getISODate, getFullDate, getRelativeDate } from '../../utils';
import { getCanonicalURL, copyToClipboard } from '../../utils/clipboard';
import { toggleEditingComment, updateHighlightedComments, deleteComment } from '../../redux/action-creators';
import * as CommentTypes from '../../utils/comment-types';
import ARCHIVE_WATERSHED_TIMESTAMP from '../../utils/archive-timestamps';
import { getDraftCU } from '../../utils/drafts';

const Comment = ({ id, postId, postUrl, isModeratingComments, openAnsweringComment }) => {
  const getComment = useMemo(makeGetComment, []);
  const {
    body, createdBy, createdAt, hideType, // data from store.comments
    isEditing, isHighlighted, // data from store.commentViews
    authorUsername, canIEdit, amISubscribedToAuthor, isTargeted, notFound // derived data
  } = useSelector(state => getComment(state, id), shallowEqual);

  const dispatch = useDispatch();

  const [isExpanded, setExpanded] = useState(false);

  const commentContainerRef = useRef({});

  const typedArrows = useRef([]); // Array of arrows (^^^) lengths, that user typing in the textarea

  const commentUrl = `${postUrl}#comment-${id}`;

  const copyURL = useCallback(() => {
    const canonicalURL = getCanonicalURL(commentUrl);
    copyToClipboard(canonicalURL);
  }, [commentUrl]);

  const toggleEditing = useCallback(() => {
    dispatch(toggleEditingComment(id));
    dispatch(updateHighlightedComments());
    typedArrows.current = [];
  }, [dispatch, id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deleteAfterConfirmation = useCallback(confirmFirst(() => dispatch(deleteComment(id))), [dispatch, id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleIconClick = useCallback(preventDefault(() => {
    if (openAnsweringComment) {
      openAnsweringComment(authorUsername);
    }
  }), [openAnsweringComment, authorUsername]);

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
        href={commentUrl}
        onClick={handleIconClick}>

        <Icon name="comment"/>
      </a>

      {hideType ? (
        <div className="comment-body">
          {getCommentPlaceholder()}

          <span className="comment-timestamp">
            {' - '}
            <Link to={commentUrl} dir="auto">
              <time dateTime={dateISO} title={dateFull}>{dateRelativeShort}</time>
            </Link>
          </span>
        </div>
      ) : isEditing ? (
        <CommentEditForm id={id} postId={postId} expandFn={setExpanded}/>
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

          <span className="comment-timestamp">
            {'-\u00a0'}
            <Link to={commentUrl} dir="auto">
              <time dateTime={dateISO} title={dateFull}>{dateRelativeShort}</time>
            </Link>
          </span>

          {' '}

          <span className="comment-likes-and-more"><span>
            {'-'}
            <CommentLikes commentId={id}/>
            <CommentMoreMenu
              isCommentMine={canIEdit} isModeratingComments={isModeratingComments}
              shareFn={copyURL}
              editFn={toggleEditing} deleteFn={deleteAfterConfirmation}/>
          </span></span>
        </div>
      )}
    </div>
  );
};

export default Comment;
