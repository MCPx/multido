import { CameraOptions, Camera } from '@ionic-native/camera';

export default (camera: Camera) => <CameraOptions>{
    destinationType: camera.DestinationType.DATA_URL,
    encodingType: camera.EncodingType.JPEG,
    mediaType: camera.MediaType.PICTURE,
    sourceType: camera.PictureSourceType.PHOTOLIBRARY,
    allowEdit: true,
    correctOrientation: true
};