import React from 'react';
import {Link} from 'react-router';

const PAGE_SIZE = 30;

const offsetObject = offset => offset ? ({offset}) : undefined;
const minOffset = offset => Math.max(offset - PAGE_SIZE, 0);
const maxOffset = offset => offset + PAGE_SIZE;

export default (props) => (
  <ul className="pager">
    {props.offset > 0 ? (
      <li><Link to={{pathname: props.location.pathname, query: offsetObject(minOffset(props.offset))}}>« Newer items</Link></li>
    ) : false}

    <li><Link to={{pathname: props.location.pathname, query: offsetObject(maxOffset(props.offset))}}>Older items »</Link></li>
  </ul>
);
