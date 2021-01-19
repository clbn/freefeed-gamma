/*
Data structure:

drafts: {
  'post-add': {
    0: 'Text1',
  }
  'post-update': {
    'postId1': 'Text1',
    'postId2': 'Text2',
    ...
  }
  'comment-add': {
    'postId1': 'Text1',
    'postId2': 'Text2',
    ...
  }
  'comment-update': {
    'commentId1': 'Text1',
    'commentId2': 'Text2',
    ...
  }
}

*/

function setDraft(section, id, text) {
  const drafts = JSON.parse(window.localStorage.getItem('drafts') ?? '{}');

  if (drafts[section] === undefined) {
    drafts[section] = {};
  }

  if (text?.trim().length > 0) {
    drafts[section][id] = text.trim();
  } else {
    delete drafts[section][id];
  }

  window.localStorage.setItem('drafts', JSON.stringify(drafts));
}

function getDraft(section, id) {
  const drafts = JSON.parse(window.localStorage.getItem('drafts') ?? '{}');
  return drafts?.[section]?.[id];
}

export function setDraftPA(text) { setDraft('post-add', 0, text); }
export function setDraftPU(id, text) { setDraft('post-update', id, text); }
export function setDraftCA(id, text) { setDraft('comment-add', id, text); }
export function setDraftCU(id, text) { setDraft('comment-update', id, text); }

export function getDraftPA() { return getDraft('post-add', 0); }
export function getDraftPU(id) { return getDraft('post-update', id); }
export function getDraftCA(id) { return getDraft('comment-add', id); }
export function getDraftCU(id) { return getDraft('comment-update', id); }
