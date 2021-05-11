import React, {useState} from 'react';
import {Dimensions, Image, Text, TouchableOpacity, View} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import ImagePicker from 'react-native-image-picker';

const imagePickerOptions = {
  title: 'YÜKLENECEK FOTOĞRAF',
  cancelButtonTitle: 'İptal',
  takePhotoButtonTitle: 'Fotoğraf çek...',
  chooseFromLibraryButtonTitle: 'Fotoğraflarından seç...',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

const IP = 'SERVER IP';

let data = {width: 1000, height: 1000};

export default function App() {
  const [imageURL, setImageURL] = useState('');

  return (
    <View>
      <View
        style={{
          width: '100%',
          height: Dimensions.get('window').height * 8.5/10,
          backgroundColor: 'black',
        }}>
        {imageURL === '' ? (
          <View style={{backgroundColor: '#fff'}}>
            <Text stlye={{color: '#fff'}}>Fotoğraf seçin</Text>
          </View>
        ) : (
          <ImageZoom
            cropWidth={Dimensions.get('window').width}
            cropHeight={Dimensions.get('window').height}
            imageWidth={data.width}
            imageHeight={data.height}>
            <Image
              source={{uri: imageURL}}
              style={{
                flex: 1,
                width: undefined,
                height: undefined,
                resizeMode: 'center',
              }}
            />
          </ImageZoom>
        )}
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: '#333',
          padding: 8,
          margin: 8,
        }}
        onPress={() => {
          console.log('pressed');
          ImagePicker.showImagePicker(imagePickerOptions, async (response) => {
            if (response.didCancel) {
              console.log('User cancelled picking an image.');
              return;
            }

            fetch('http://' + IP + ':3000/upload', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                img: response.data,
              }),
            })
              .then((response) => response.json())
              .then((response) => {
                data = response;
                setImageURL('http://' + IP + ':3000' + response.url);
              })
              .catch((error) => {
                console.warn(error);
              });
          });
        }}>
        <Text style={{color: '#fff'}}>Fotoğraf Yükle</Text>
      </TouchableOpacity>
    </View>
  );
}
