const getIdAndHidden = (state) => (postId) => ({
  id: postId,
  isHidden: state.posts[postId].isHidden
});

export const getVisibleEntriesWithHidden = (state) => state.feedViewState.visibleEntries.map(getIdAndHidden(state));

export const getHiddenEntriesWithHidden = (state) => state.feedViewState.hiddenEntries.map(getIdAndHidden(state));
