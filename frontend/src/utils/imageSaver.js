import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Platform } from 'react-native';


export const saveImageToGallery = async (imageUrl) => {
    try {
        const { status } = await MediaLibrary.requestPermissionsAsync(true);

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to save the image.');
            return false;
        }

        const filename = imageUrl.split('/').pop();
        const fileUri = FileSystem.documentDirectory + filename;

        const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);

        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('Virtual Try-On', asset, false);

        Alert.alert('Success', 'Image saved to gallery!');
        return true;
    } catch (error) {
        console.log(error);
        Alert.alert('Error', 'Failed to save image.');
        return false;
    }
};
