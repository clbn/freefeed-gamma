import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadAttachment } from '../services/api';
import { convertToJpeg } from './convert-to-jpeg';

export const useUploader = (onUpload) => {
  const [queueLength, setQueueLength] = useState(0);

  const uploadFile = useCallback(file => {
    setQueueLength(l => l + 1);
    uploadAttachment(file)
      .then(res => res.json())
      .then(data => {
        onUpload(data?.attachments?.url);
        setQueueLength(l => l - 1);
      });
  }, [onUpload]);

  const handlePaste = useCallback(e => {
    const items = e.clipboardData?.items || [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image/') > -1) {
        e.preventDefault(); // for an image copied from Finder, prevent pasting its filename
        const file = items[i].getAsFile();
        if (!file.name) {
          file.name = 'image.png';
        }
        convertToJpeg(file).then(uploadFile);
      }
    }
  }, [uploadFile]);

  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(f => uploadFile(f));
  }, [uploadFile]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true
  });

  return {
    getDropzoneProps: getRootProps,
    getFileInputProps: getInputProps,
    openFileDialog: open,
    handlePaste,
    queueLength
  };
};
