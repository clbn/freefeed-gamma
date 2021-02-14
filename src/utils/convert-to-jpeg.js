/**
 * This function was initially implemented by David Mzareulyan (davidmz) for freefeed-react-client:
 * https://github.com/FreeFeed/freefeed-react-client/blob/cfda7e92bee8742901d69c6354d58e6618555719/src/utils/jpeg-if-needed.js
 *
 * Two minor changes to the David's implementation are:
 * - reflecting that we take File, not Blob, as the input parameter;
 * - fixing the filename issue: blobs don't have names, so conversion from JPEG Blob to JPEG File was added.
 */

/**
 * Convert 'image/png' file to 'image/jpeg' file if:
 * 1) The PNG size is more than 50 KiB and
 * 2) JPEG size is less than half the PNG size.
 *
 * The returning promise is never failed and returns
 * either JPEG or the original PNG.
 *
 * @param {File} file
 * @returns {Promise<Blob>}
 */
export async function convertToJpeg(file) {
  if (file.type !== 'image/png' || file.size < 50 * 1024) {
    return file;
  }

  const src = window.URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Cannot load image'));
      image.src = src;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    const jpegBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    const jpegFileName = file.name.replace(/\.png$/, '.jpg');
    const jpegFile = new File([jpegBlob], jpegFileName);

    if (jpegFile.size < file.size / 2) {
      return jpegFile;
    }
  } catch {
    // skip any errors
  } finally {
    window.URL.revokeObjectURL(src);
  }

  return file;
}
