// @ts-nocheck
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

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



import { pick } from '@react-native-documents/picker';

export const pickFile = async () => {
  try {
    const result = await pick({
      type: ['*/*'],
      allowMultiSelection: false,
      copyTo: 'cachesDirectory',
    });

    return Array.isArray(result) ? result[0] : result;
  } catch (err: any) {
    if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
      return null;
    }
    throw err;
  }
};

