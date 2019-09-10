import React, { useRef, useCallback } from 'react';
import Tippy from '@tippy.js/react';
import 'styles/more-menu.scss';

import { confirmFirst } from '../../utils';

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

  const menuContent = (
    <ul className="more-menu-items" onClick={hideMenu}>
      {props.post.canIEdit && (
        <li><a onClick={props.toggleEditingPost}>Edit</a></li>
      )}

      {props.post.isModeratingComments
        ? <li><a onClick={props.toggleModeratingComments}>Stop moderating comments</a></li>
        : <li><a onClick={props.toggleModeratingComments}>Moderate comments</a></li>}

      {props.post.commentsDisabled
        ? <li><a onClick={props.enableComments}>Enable comments</a></li>
        : <li><a onClick={props.disableComments}>Disable comments</a></li>}

      <li className="danger"><a onClick={confirmFirst(props.deletePost)}>Delete</a></li>
    </ul>
  );

  return (
    <Tippy onCreate={onCreate} content={menuContent} {...tippyOptions}>
      <a className="more-menu-trigger">More&nbsp;&#x25be;</a>
    </Tippy>
  );
}
