import React, { useRef, useCallback } from 'react';
import Tippy from '@tippyjs/react';

import { confirmFirst } from '../../utils';
import Throbber from './throbber';
import Icon from './icon';
import 'styles/more-menu.scss';

const tippyOptions = {
  animation: 'fade',
  arrow: true,
  duration: [null, 0], // default for showing, instant for hiding
  interactive: true,
  placement: 'bottom-start',
  theme: 'gamma gamma-dropdown',
  trigger: 'click',
  zIndex: 9
};

export default function({
  id, isSaved, isHidden, canIModerate, canIEdit, isEditing,
  isModeratingComments, commentsDisabled, isSavingForLater, isHiding,
  hidePost, unhidePost, savePost, unsavePost, toggleEditingPost, deletePost,
  toggleModeratingComments, disableComments, enableComments
}) {
  const tippyInstance = useRef();
  const onCreate = useCallback(instance => (tippyInstance.current = instance), []);
  const hideMenu = useCallback(() => { tippyInstance.current.hide(); }, []);

  const handleHidePost = useCallback(() => hidePost(id), [id, hidePost]);
  const handleUnhidePost = useCallback(() => unhidePost(id), [id, unhidePost]);
  const handleSavePost = useCallback(() => savePost(id), [id, savePost]);
  const handleUnsavePost = useCallback(() => unsavePost(id), [id, unsavePost]);
  const handleToggleEditingPost = useCallback(() => toggleEditingPost(id), [id, toggleEditingPost]);
  const handleToggleModeratingComments = useCallback(() => toggleModeratingComments(id), [id, toggleModeratingComments]);
  const handleDisableComments = useCallback(() => disableComments(id), [id, disableComments]);
  const handleEnableComments = useCallback(() => enableComments(id), [id, enableComments]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDeletePost = useCallback(confirmFirst(() => deletePost(id)), [id, deletePost]);

  const menuContent = (
    <ul className="more-menu-items" onClick={hideMenu}>
      {isSaved
        ? <li><a onClick={handleUnsavePost}>Un-save</a></li>
        : <li><a onClick={handleSavePost}>Save for later</a></li>}

      {isHidden
        ? <li><a onClick={handleUnhidePost}>Un-hide on homepage</a></li>
        : <li><a onClick={handleHidePost}>Hide on homepage</a></li>}

      {canIModerate && <>
        {canIEdit && (
          isEditing
            ? <li><a onClick={handleToggleEditingPost}>Cancel editing</a></li>
            : <li><a onClick={handleToggleEditingPost}>Edit</a></li>
        )}

        {isModeratingComments
          ? <li><a onClick={handleToggleModeratingComments}>Stop moderating comments</a></li>
          : <li><a onClick={handleToggleModeratingComments}>Moderate comments</a></li>}

        {commentsDisabled
          ? <li><a onClick={handleEnableComments}>Enable comments</a></li>
          : <li><a onClick={handleDisableComments}>Disable comments</a></li>}

        <li className="danger"><a onClick={handleDeletePost}>Delete</a></li>
      </>}
    </ul>
  );

  return (
    <Tippy onCreate={onCreate} content={menuContent} {...tippyOptions}>
      <a className="more-menu-trigger" title="More options">
        <Icon name="more"/>
        {(isSavingForLater || isHiding) && <Throbber name="post-hide"/>}
      </a>
    </Tippy>
  );
}
