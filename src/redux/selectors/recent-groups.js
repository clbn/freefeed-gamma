import { createSelector } from 'reselect';

const GROUPS_SIDEBAR_LIST_LENGTH = 4;

const getRecentGroups = createSelector(
  [
    (state) => state.me.subscriptions,
    (state) => state.users
  ],
  (subscriptions, users) => {
    return (subscriptions || [])
      .map(id => users[id] || {})
      .filter(u => u.type === 'group')
      .sort((a, b) => (+b.updatedAt) - (+a.updatedAt))
      .slice(0, GROUPS_SIDEBAR_LIST_LENGTH);
  }
);

export default getRecentGroups;
