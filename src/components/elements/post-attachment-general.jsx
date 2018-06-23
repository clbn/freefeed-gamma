import React from 'react';
import numeral from 'numeral';

export default (props) => {
  const formattedFileSize = numeral(props.fileSize).format('0.[0] b');
  const nameAndSize = props.fileName + ' (' + formattedFileSize + ')';

  const removeAttachment = () => props.removeAttachment(props.id);

  return (
    <div className="attachment">
      <a href={props.url} title={nameAndSize} target="_blank" rel="noopener">
        <svg className="icon-file"><use xlinkHref="#icon-file"></use></svg>
        <span>{nameAndSize}</span>
      </a>

      {props.isEditing ? (
        <i className="remove-attachment" title="Remove file" onClick={removeAttachment}>
          <svg className="icon-times"><use xlinkHref="#icon-times"></use></svg>
        </i>
      ) : false}
    </div>
  );
};
