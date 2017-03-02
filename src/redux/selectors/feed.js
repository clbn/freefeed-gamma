import { createSelector } from 'reselect';

const getIdAndHidden = (posts) => (postId) => ({
  id: postId,
  isHidden: posts[postId].isHidden
});

export const getVisibleEntriesWithHidden = createSelector(
  [
    (state) => state.feedViewState.visibleEntries,
    (state) => state.posts
  ],
  (visibleEntries, posts) => {
    return visibleEntries.map(getIdAndHidden(posts));
  }
);

export const getHiddenEntriesWithHidden = createSelector(
  [
    (state) => state.feedViewState.hiddenEntries,
    (state) => state.posts
  ],
  (hiddenEntries, posts) => {
    return hiddenEntries.map(getIdAndHidden(posts));
  }
);
