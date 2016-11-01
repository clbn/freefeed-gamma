import {createSelector} from 'reselect';

const emptyArray = [];

export const makeGetPost = () => createSelector(
  [
    (state, props) => state.posts[props.id],
    (state, props) => state.postViews[props.id],
    (state, props) => {
      const authorId = state.posts[props.id].createdBy;
      return state.users[authorId] || {id: authorId};
    },
    (state) => state.subscriptions,
    (state) => state.subscribers
  ],
  (post, postView, createdBy, subscriptions, subscribers) => {
    if (!post) {
      return {};
    }

    const recipients = post.postedTo
      .map((subscriptionId) => {
        const userId = (subscriptions[subscriptionId] || {}).user;
        const subscriptionType = (subscriptions[subscriptionId] || {}).name;
        const isDirectToSelf = (userId === post.createdBy && subscriptionType === 'Directs');
        return !isDirectToSelf ? userId : false;
      })
      .map(userId => subscribers[userId])
      .filter(user => user);

    const directRecipients = post.postedTo
      .filter((subscriptionId) => {
        let subscriptionType = (subscriptions[subscriptionId] || {}).name;
        return (subscriptionType === 'Directs');
      });
    const isDirect = (directRecipients.length > 0);

    return {
      ...post,
      ...postView,
      createdBy,
      recipients,
      isDirect,
      attachments: emptyArray,
      usersLikedPost: emptyArray,
      comments: emptyArray,
      omittedComments: 0
    };
  }
);
