import React from 'react';
import { Link } from 'react-router';

const PAGE_SIZE = 30;

const offsetObject = offset => offset ? ({ offset }) : undefined;
const minOffset = offset => Math.max(offset - PAGE_SIZE, 0);
const maxOffset = offset => offset + PAGE_SIZE;

export default (props) => {
  const allParams = { ...props.location.query };
  delete allParams.offset;

  const paramsForNewer = { ...allParams, ...offsetObject(minOffset(props.offset)) };
  const paramsForOlder = { ...allParams, ...offsetObject(maxOffset(props.offset)) };

  return (
    <ul className="pager">
      {props.offset > 0 ? (
        <li className="previous">
          <Link to={{ pathname: props.location.pathname, query: paramsForNewer }}>
            {'\u2190'} Newer entries
          </Link>
        </li>
      ) : false}

      {!props.isLastPage ? (
        <li className="next">
          <Link to={{ pathname: props.location.pathname, query: paramsForOlder }}>
            Older entries {'\u2192'}
          </Link>
        </li>
      ) : false}
    </ul>
  );
};
