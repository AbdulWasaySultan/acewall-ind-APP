/**
 * Converts a Base64 string into a File object.
 * @param {string} base64Data - The raw base64 string (without the data:image prefix).
 * @param {string} contentType - The mimeType (e.g., 'image/png').
 * @param {string} fileName - The desired name for the file.
 */
export const base64ToFile = (base64Data, contentType, fileName) => {
  // 1. Decode base64 string to binary data
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  
  // 2. Create a File object from the binary data
  return new File([byteArray], fileName, { type: contentType });
};