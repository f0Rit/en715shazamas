import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MediaStreamRecorder from 'msr';
import micImage from './mic.png';


const AudioRecorder = () => {
    const [recording, setRecording] = useState(false);
    const [showMic, setShowMic] = useState(true);
    const [statusText, setStatusText] = useState("Paspausk mygtuką, kai muzona paleisi");
    const [songInfo, setSongInfo] = useState(null);

    useEffect(() => {
        let wakeLock = null;

        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await navigator.wakeLock.request('screen');
                    console.log('Screen wake lock is active.');
                }
            } catch (error) {
                console.error('Failed to request screen wake lock:', error);
            }
        };

        const releaseWakeLock = () => {
            if (wakeLock) {
                wakeLock.release();
                wakeLock = null;
                console.log('Screen wake lock is released.');
            }
        };

        requestWakeLock();

        return () => {
            releaseWakeLock();
        };
    }, []);

    useEffect(() => {
        let mediaRecorder = null;
        let mediaStream = null;

        if (recording) {
            const mediaConstraints = { audio: true };

            const handleDataAvailable = async (blob) => {
                let analyzeSong = blob.size > 200624 ;
                blobToBase64(blob, async function (base64String) {
                    const audioData = correctThaData(base64String);
                    setStatusText('Analizuoju');
                    if (analyzeSong) {
                        await detectSong(audioData);
                    }
                   // correctSong = true;
                    console.log(audioData);
                    setRecording(false);
                });
            };

            function correctThaData(data) {
                let editedData = data.replace(/^data:audio\/pcm;base64,/, '');
                return editedData;
            }

            const detectSong = async (audioData) => {
                try {
                    const response = await axios({
                        method: 'POST',
                        url: 'https://shazam.p.rapidapi.com/songs/detect',
                        params: { locale: 'en-US' },
                        headers: {
                            'content-type': 'text/plain',
                            'X-RapidAPI-Key': '69ad688769mshc98e97be129abd6p109061jsn28742c3c444d',
                            'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
                        },
                        data: audioData
                    });

                    console.log(response);
                    if (response && response.data && response.data.track) {
                        const song = response.data.track.title;
                        const artist = response.data.track.subtitle;
                        setSongInfo({ song: song, artist: artist });
                        if (song.includes('Rolling In the Deep') || artist === 'Adele') {
                            setStatusText('en715amazingsinger');
                        }
                        else {
                            setStatusText("Ne ta daina");
                        }
                    } else {
                        setStatusText('Nieko gero neišgirdau, mėgink dar kartą');
                    }
                
                } catch (error) {
                    setStatusText('KLAIDA. Mėgink dar kartą');
                    console.error(error);
                }
            };

            function blobToBase64(blob, callback) {
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    callback(reader.result);
                };
            }

            const startRecording = (stream) => {
                setStatusText('Klausau');
                mediaStream = stream;
                mediaRecorder = new MediaStreamRecorder(stream);
                mediaRecorder.mimeType = 'audio/pcm';
                mediaRecorder.audioChannels = 1;
                mediaRecorder.ondataavailable = handleDataAvailable;
                mediaRecorder.start(3000);
            };

            const handleMediaError = (e) => {
                console.error('media error', e);
            };

            navigator.mediaDevices
                .getUserMedia(mediaConstraints)
                .then(startRecording)
                .catch(handleMediaError);
            return () => {
                console.log("stopinu");
                mediaRecorder?.stop();
                mediaStream?.getTracks().forEach((track) => {
                    track.stop();
                });
                setTimeout(setStatusText, 3000, "Paspausk mygtuką, kai muzoną paleisi");
                setTimeout(setSongInfo, 4000, null);
                setTimeout(setShowMic, 3000, true);
            };
        }
    }, [recording]);

    const handleStartRecording = () => {
        setShowMic(false);
        setRecording(true);
    };

    const buttonStyle = {
        width: '10vw',  // Adjust the width based on the viewport width
        height: '10vw', // Adjust the height based on the viewport width
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>

            <p>{statusText}</p>

            {showMic && (
                <button onClick={handleStartRecording} style={buttonStyle}>
                    <img src={micImage} alt="Microphone" style={{ width: '100%', height: '100%' }} />
                </button>
            )}
            {songInfo && songInfo.song && songInfo.artist && (
                <p>
                    Daina: {songInfo.song}, Atlikejas: {songInfo.artist}
                </p>
            )}
        </div>
    );
};

export default AudioRecorder;