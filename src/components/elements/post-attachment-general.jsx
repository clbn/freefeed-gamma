import React from 'react';
import numeral from 'numeral';

import Icon from "./icon";

export default (props) => {
  const formattedFileSize = numeral(props.fileSize).format('0.[0] b');
  const nameAndSize = props.fileName + ' (' + formattedFileSize + ')';

  const removeAttachment = () => props.removeAttachment(props.id);

  return (
    <div className="attachment">
      <a href={props.url} title={nameAndSize} target="_blank" rel="noopener">
        <Icon name="file"/>
        <span>{nameAndSize}</span>
      </a>

      {props.isEditing ? (
        <span className="remove-attachment" title="Remove file" onClick={removeAttachment}>
          <Icon name="times"/>
        </span>
      ) : false}
    </div>
  );
};
