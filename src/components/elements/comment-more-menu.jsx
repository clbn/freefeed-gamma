import React, { useRef, useCallback } from 'react';
import Tippy from '@tippyjs/react';

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

const CommentMoreMenu = ({ isCommentMine, isModeratingComments, editFn, deleteFn }) => {
  const tippyInstance = useRef(null);
  const onCreate = useCallback(instance => (tippyInstance.current = instance), []);
  const hideMenu = useCallback(() => { tippyInstance.current.hide(); }, []);

  const menuContent = (
    <ul className="more-menu-items" onClick={hideMenu}>
      {isCommentMine && (
        <li><a onClick={editFn}>Edit</a></li>
      )}
      {(isCommentMine || isModeratingComments) && (
        <li className="danger"><a onClick={deleteFn}>Delete</a></li>
      )}
    </ul>
  );

  return (
    <Tippy onCreate={onCreate} content={menuContent} {...tippyOptions}>
      <a className="more-menu-trigger" title="More options">
        <Icon name="more-small"/>
      </a>
    </Tippy>
  );
};

export default CommentMoreMenu;
