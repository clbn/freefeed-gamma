import React, { useCallback } from 'react';
import numeral from 'numeral';

import Icon from './icon';

export default ({ id, fileName, fileSize, url, isEditing, removeAttachment }) => {
  const formattedFileSize = numeral(fileSize).format('0.[0] b');
  const nameAndSize = fileName + ' (' + formattedFileSize + ')';

  const handleRemove = useCallback(() => removeAttachment(id), [id, removeAttachment]);

  return (
    <div className="attachment">
      <a href={url} title={nameAndSize} target="_blank" rel="noopener">
        <Icon name="file"/>
        {nameAndSize}
      </a>

      {isEditing && (
        <span className="remove-attachment" title="Remove file" onClick={handleRemove}>
          <Icon name="times"/>
        </span>
      )}
    </div>
  );
};
