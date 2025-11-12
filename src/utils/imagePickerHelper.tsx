// @ts-nocheck
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker, { types } from 'react-native-document-picker';

export const pickImageFromCamera = async () => {
  return new Promise((resolve, reject) => {
    const options = {
      mediaType: 'photo',
      saveToPhotos: true,
      includeBase64: false,
      quality: 0.7,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) return resolve(null);
      if (response.errorCode) {
        console.log('Camera Error:', response.errorMessage);
        return reject(response.errorMessage);
      }

      if (response.assets && response.assets.length > 0) {
        resolve(response.assets[0]);
      } else {
        resolve(null);
      }
    });
  });
};

export const pickImageFromGallery = async () => {
  return new Promise((resolve, reject) => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 1,
      includeBase64: false,
      quality: 0.7,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return resolve(null);
      if (response.errorCode) {
        console.log('Gallery Error:', response.errorMessage);
        return reject(response.errorMessage);
      }

      if (response.assets && response.assets.length > 0) {
        resolve(response.assets[0]);
      } else {
        resolve(null);
      }
    });
  });
};
export const pickFile = async (): Promise<DocumentPicker.DocumentPickerResponse | null> => {
  try {
    const result = await DocumentPicker.pick({
      type: [types.allFiles],  // all file types
      allowMultiSelection: false,
    });

    // result can be an array if allowMultiSelection is true
    if (Array.isArray(result) && result.length > 0) {
      return result[0];
    }

    return result ?? null;
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      return null; // user cancelled
    }
    throw err;
  }
};
