import React from 'react';

import { preventDefault, pluralForm } from '../../utils';
import Throbber from './throbber';

const getOmittedClikes = (n) => (n ? ' with ' + pluralForm(n, 'like') : '');

export default (props) => (
  <div className="comment">
    {props.isLoading && (
      <Throbber name="more-comments"/>
    )}
    <a className="more-comments-link"
      href={props.postUrl}
      onClick={preventDefault(props.showMoreComments)}>

      <span className="more-comments-core">{props.omittedComments} more comments</span>

      <span className="more-comments-clikes">{getOmittedClikes(props.omittedCommentLikes)}</span>
    </a>
  </div>
);
