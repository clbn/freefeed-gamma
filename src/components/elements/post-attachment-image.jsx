import React, { useCallback } from 'react';
import numeral from 'numeral';
import { SortableHandle } from 'react-sortable-hoc';

import { preventDefault } from '../../utils';
import Icon from './icon';

const DragHandle = SortableHandle(props => props.children);

export default ({
  id, fileName, fileSize, imageSizes, url, thumbnailUrl,
  handleClick, isEditing, removeAttachment
}) => {
  const formattedFileSize = numeral(fileSize).format('0.[0] b');
  const formattedImageSize = (imageSizes.o ? `, ${imageSizes.o.w}×${imageSizes.o.h}px` : '');
  const nameAndSize = fileName + ' (' + formattedFileSize + formattedImageSize + ')';

  let srcSet;
  if (imageSizes.t2 && imageSizes.t2.url) {
    srcSet = imageSizes.t2.url + ' 2x';
  } else if (imageSizes.o && imageSizes.t && imageSizes.o.w <= imageSizes.t.w * 2) {
    srcSet = (imageSizes.o.url || url) + ' 2x';
  }

  const imageAttributes = {
    src: imageSizes.t && imageSizes.t.url || thumbnailUrl,
    srcSet,
    alt: nameAndSize,
    width: imageSizes.t && imageSizes.t.w || imageSizes.o && imageSizes.o.w || undefined,
    height: imageSizes.t && imageSizes.t.h || imageSizes.o && imageSizes.o.h || undefined
  };

  // Make sure the image is not wider than viewport (it makes sense for mobile screens)
  const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const attachmentMargins = 15 + 2 + 2 + 15; // app margin + border+padding + padding+border + app margin
  const maxWidth = viewportWidth - attachmentMargins;
  imageAttributes.style = {
    maxWidth: maxWidth,
    maxHeight: imageAttributes.width && imageAttributes.height && Math.round(maxWidth / imageAttributes.width * imageAttributes.height)
  };

  const handleRemove = useCallback(() => removeAttachment(id), [id, removeAttachment]);

  const attachmentBody = (
    <a href={url} title={nameAndSize} onClick={preventDefault(handleClick)} target="_blank" rel="noopener">
      {thumbnailUrl ? (
        <img {...imageAttributes}/>
      ) : (
        id
      )}
    </a>
  );

  if (!isEditing) {
    return <div className="attachment">{attachmentBody}</div>;
  }

  const removeButton = (
    <a className="remove-attachment" title="Remove image" onClick={handleRemove}>
      <Icon name="times"/>
    </a>
  );

  return (
    <div className="attachment">
      <DragHandle>
        {attachmentBody}
      </DragHandle>

      {removeButton}
    </div>
  );
};
