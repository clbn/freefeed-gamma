import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadAttachment } from '../services/api';

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
    queueLength
  };
};
