import { api as apiConfig } from '../../config/config';
import { getToken } from './auth';
import io from 'socket.io-client';

const dummyPost = {
  getBoundingClientRect: _ => ({ top: 0 })
};

const scrollCompensator = dispatchAction => (...actionParams) => {
  //we hope that markup will remain the same — best tradeoff between this and code all over components
  const postCommentNodes = [...document.querySelectorAll('.post, .comment')];

  const firstVisible = postCommentNodes.filter(element => element.getBoundingClientRect().top > 0)[0];

  const nearestTopIndex = postCommentNodes.indexOf(firstVisible) - 1;

  const nearestTop = postCommentNodes[nearestTopIndex] || dummyPost;

  const topBefore = nearestTop.getBoundingClientRect().top;
  const heightBefore = document.body.offsetHeight;

  // Dispatching event here, when it's done we can measure the page again
  const res = dispatchAction(...actionParams);

  if (res.then) {
    res.then(() => {
      const topAfter = nearestTop.getBoundingClientRect().top;
      const heightAfter = document.body.offsetHeight;

      if (topAfter !== topBefore) {
        scrollBy(0, heightAfter - heightBefore);
      }
    });
  }
};

const bindSocketEventHandlers = socket => eventHandlers => {
  Object.keys(eventHandlers).forEach((event) => socket.on(event, scrollCompensator(eventHandlers[event])));
};

const openSocket = _ => io.connect(`${apiConfig.host}/`, { query: `token=${getToken()}` });

export function init(eventHandlers) {
  const socket = openSocket();

  bindSocketEventHandlers(socket)(eventHandlers);

  let subscription;
  let subscribe;

  return {
    unsubscribe: _ => {
      if (subscription) {
        socket.emit('unsubscribe', subscription);
        socket.off('reconnect', subscribe);
      }
    },
    subscribe: newSubscription => {
      subscription = newSubscription;
      subscribe = () => socket.emit('subscribe', subscription);
      socket.on('reconnect', subscribe);
      subscribe();
    },
    disconnect: _ => socket.disconnect()
  };
}
