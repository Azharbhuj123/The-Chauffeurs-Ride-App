// @ts-nocheck
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import { pick, types, isCancel } from '@react-native-documents/picker';

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
export const pickFile = async () => {
  return null;
  try {
    const results = await pick({
      type: [types.allFiles],
      allowMultiSelection: false,
    });

    if (results && results.length > 0) {
      return results[0]; // return the first file only
    }
    return null;
  } catch (err) {
    if (isCancel(err)) {
      return null;
    }
    throw err;
  }
};
