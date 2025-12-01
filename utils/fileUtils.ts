

// Returns just the base64 data
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('File could not be read as a data URL string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

// Returns the full data URL string (e.g., "data:image/png;base64,...")
export const fileToBase64WithDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('File could not be read as a data URL string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

// Converts a data URL string to a File object
export const dataURLtoFile = (dataUrl: string, filename: string): File | null => {
  const arr = dataUrl.split(',');
  if (arr.length < 2) {
    return null;
  }
  const match = arr[0].match(/:(.*?);/);
  if (!match) {
    return null;
  }
  const mime = match[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};