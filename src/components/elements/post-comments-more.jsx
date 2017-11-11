import React from 'react';

import { preventDefault } from '../../utils';
import throbber16 from 'assets/images/throbber-16.gif';
import { pluralForm } from "../../utils/index";

const getOmittedClikes = (n) => (n ? ' with ' + pluralForm(n, 'like') : '');

export default (props) => (
  <div className="comment">
    <span className="more-comments-throbber">
      {props.isLoading ? (
        <img width="16" height="16" src={throbber16}/>
      ) : false}
    </span>
    <a className="more-comments-link"
       href={props.postUrl}
       onClick={preventDefault(props.showMoreComments)}>
      {props.omittedComments} more comments
    </a>
    <span className="more-comments-clikes">{getOmittedClikes(props.omittedCommentLikes)}</span>
  </div>
);
