import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const onData = (recordedBlob) => {
    // console.log("recordedBlob is: ", recordedBlob);
  };

  const onStop = (recordedBlob) => {
    const fileReader = new FileReader();
    fileReader.onload = function() {
      const arrayBuffer = this.result;
      const buffer = Buffer.from(arrayBuffer);
      const base64String = buffer.toString('base64');
      setAudioData(base64String);
      console.log(audioData);
    };
    fileReader.readAsArrayBuffer(recordedBlob);
  };

  const sendAudio = async () => {
    console.log(audioData);
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://shazam.p.rapidapi.com/songs/v2/detect',
        params: {locale: 'en-US'},
        headers: {
          'content-type': 'text/plain',
          'X-RapidAPI-Key': '69ad688769mshc98e97be129abd6p109061jsn28742c3c444d',
          'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
        },
        data: audioData
      });

      if (response) {
        const song = response.data.title;
        const artist = response.data.subtitle;
        console.log(response);
        console.log(`Song: ${song}, Artist: ${artist}`);

        if (song === 'Stan' && artist === 'Eminem') {
          const audio = new Audio('data:audio/mp3;base64,//NExAARAAAAwAAAAHQAAAAAIAAAAAQAAAEDBAABAAAALAAAAAABAAEAAAICRAEAOw==');
          audio.play();
          setTimeout(() => {
            const codeAudio = new Audio('data:audio/mp3;base64,//NExAARAAAAwAAAAHQAAAAAIAAAAAQAAAEDBAABAAAALAAAAAABAAEAAAICQAEAOw==');
            codeAudio.play();
          }, 2000);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <ReactMic
        record={isRecording}
        onData={onData}
        onStop={onStop}
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />
      <div>
        <button onClick={startRecording}>Start recording</button>
        <button onClick={stopRecording}>Stop recording</button>
        <button onClick={sendAudio}>Send audio</button>
      </div>
    </>
  );
};

export default Recorder;
