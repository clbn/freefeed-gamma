import React, { useRef, useCallback } from 'react';
import Tippy from '@tippy.js/react';

import { confirmFirst } from '../../utils';
import Throbber from './throbber';
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

export default function(props) {
  const tippyInstance = useRef(null);
  const onCreate = useCallback(instance => (tippyInstance.current = instance), []);
  const hideMenu = useCallback(() => { tippyInstance.current.hide(); }, []);

  const id = props.id;
  const hidePost = useCallback(() => props.hidePost(id), [id]);
  const unhidePost = useCallback(() => props.unhidePost(id), [id]);
  const toggleEditingPost = useCallback(() => props.toggleEditingPost(id), [id]);
  const toggleModeratingComments = useCallback(() => props.toggleModeratingComments(id), [id]);
  const disableComments = useCallback(() => props.disableComments(id), [id]);
  const enableComments = useCallback(() => props.enableComments(id), [id]);
  const deletePost = useCallback(() => props.deletePost(id), [id]);

  const menuContent = (
    <ul className="more-menu-items" onClick={hideMenu}>
      {props.isInHomeFeed && (
        props.isHidden
          ? <li><a onClick={unhidePost}>Un-hide on homepage</a></li>
          : <li><a onClick={hidePost}>Hide on homepage</a></li>
      )}

      {props.canIModerate && <>
        {props.canIEdit && (
          props.isEditing
            ? <li><a onClick={toggleEditingPost}>Cancel editing</a></li>
            : <li><a onClick={toggleEditingPost}>Edit</a></li>
        )}

        {props.isModeratingComments
          ? <li><a onClick={toggleModeratingComments}>Stop moderating comments</a></li>
          : <li><a onClick={toggleModeratingComments}>Moderate comments</a></li>}

        {props.commentsDisabled
          ? <li><a onClick={enableComments}>Enable comments</a></li>
          : <li><a onClick={disableComments}>Disable comments</a></li>}

        <li className="danger"><a onClick={confirmFirst(deletePost)}>Delete</a></li>
      </>}
    </ul>
  );

  return (
    <Tippy onCreate={onCreate} content={menuContent} {...tippyOptions}>
      <a className="more-menu-trigger">
        More&nbsp;&#x25be;
        {props.isHiding && <Throbber name="post-hide"/>}
      </a>
    </Tippy>
  );
}
