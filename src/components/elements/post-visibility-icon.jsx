import React from 'react';

const PostVisibilityIcon = (props) => {
  // "Lock icon": check if the post is truly private, "partly private" or public.
  // Truly private:
  // - posted to author's own private feed and/or
  // - sent to users as a direct message and/or
  // - posted into private groups
  // Public:
  // - posted to author's own public feed and/or
  // - posted into public groups
  // "Partly private":
  // - has mix of private and public recipients

  const publicRecipients = props.recipients.filter((recipient) => (
    recipient.isPrivate === '0' &&
    (recipient.id === props.authorId || recipient.type === 'group')
  ));

  const isReallyPrivate = (publicRecipients.length === 0);

  if (isReallyPrivate) {
    return <i className="post-lock-icon fa fa-lock" title="This entry is private"></i>;
  }

  return false;
};

export default PostVisibilityIcon;
