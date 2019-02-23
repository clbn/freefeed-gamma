import React from 'react';

import DummyPost from './dummy-post';
import Post from './post';

const HiddenEntriesToggle = (props) => {
  const entriesForm = (props.count > 1 ? 'entries' : 'entry');
  let label;

  if (props.isOpen) {
    label = <>&#x25bc; <span>Don't show {props.count} hidden {entriesForm}</span></>;
  } else {
    label = <>&#x25ba; <span>Show {props.count} hidden {entriesForm}</span></>;
  }

  return (
    <div className="hidden-posts-toggle">
      <a onClick={props.toggle}>
        {label}
      </a>
    </div>
  );
};

export default (props) => {
  const getEntryComponent = section => post => {
    const isRecentlyHidden = (props.isInHomeFeed && post.isHidden && (section === 'visible'));

    return (
      <Post
        id={post.id}
        key={post.id}
        isInHomeFeed={props.isInHomeFeed}
        isInUserPostFeed={props.isInUserPostFeed}
        isRecentlyHidden={isRecentlyHidden}/>
    );
  };

  const visibleEntries = props.visibleEntries.map(getEntryComponent('visible'));
  const hiddenEntries = (props.hiddenEntries || []).map(getEntryComponent('hidden'));

  return (
    <div className="posts">
      {props.isLoading ? (
        <div>
          <DummyPost/>
          <DummyPost/>
          <DummyPost/>
        </div>
      ) : false}

      {visibleEntries}

      {hiddenEntries.length > 0 ? (
        <div>
          <HiddenEntriesToggle
            count={hiddenEntries.length}
            isOpen={props.isHiddenRevealed}
            toggle={props.toggleHiddenPosts}/>

          {props.isHiddenRevealed ? hiddenEntries : false}
        </div>
      ) : false}
    </div>
  );
};
