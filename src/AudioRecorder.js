import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MediaStreamRecorder from 'msr';
import micImage from './mic.png';


const AudioRecorder = () => {
    const [recording, setRecording] = useState(false);
    const [statusText, setStatusText] = useState("Paspausk mygtuką, kai muzona paleisi");
    const [songInfo, setSongInfo] = useState(null);
    const [correctSongFound, setCorrectSongFound] = useState(false);


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
        let mediaRecorder;
        let mediaStream;
        let correctSong = false;

        if (recording) {
            const mediaConstraints = { audio: true };

            const handleDataAvailable = async (blob) => {
                blobToBase64(blob, async function (base64String) {
                    const audioData = correctThaData(base64String);
                    setStatusText('Analizuoju');
                    await detectSong(audioData);
                  //  correctSong = true;
                    stopRecording();
                    console.log(audioData);
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
                        url: 'https://shazam.p.rapidapi.com/songs/v2/detect',
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
                        if (song === 'Rolling In the Deep' || artist === 'Adele') {
                            correctSong = true;
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
                mediaStream = stream;
                mediaRecorder = new MediaStreamRecorder(stream);
                mediaRecorder.mimeType = 'audio/pcm';
                mediaRecorder.audioChannels = 1;
                mediaRecorder.ondataavailable = handleDataAvailable;
                mediaRecorder.start(3000);
                setStatusText('Klausau');
                setRecording(true);
            };

            const stopRecording = () => {
                mediaStream.getTracks().forEach((track) => {
                    track.stop();
                });
                mediaRecorder.stop();
                if (correctSong) {
                    setTimeout(setCorrectSongFound, 2000, true);
                }
                setRecording(false);
            };

            const handleMediaError = (e) => {
                console.error('media error', e);
            };

            navigator.mediaDevices
                .getUserMedia(mediaConstraints)
                .then(startRecording)
                .catch(handleMediaError);
            return () => {
            };
        }
    }, [recording]);

    const handleStartRecording = () => {
        setRecording(true);
    };

    useEffect(() => {
        async function tellAnswer() {
            if (correctSongFound) {
                console.log("lol");
                setStatusText('Sneku Atsakyma');
                await new Promise(resolve => setTimeout(resolve, 10)); // Introduce a slight delay
                if ('speechSynthesis' in window) {
                    await speakUtterance();
                } else {
                    setStatusText('Jūsų įrenginys nepalaiko šio svarbaus funkcionalumo.');
                }
                setCorrectSongFound(false);
                setStatusText("Paspausk mygtuką, kai muzoną paleisi");
            }
        }
        const speakUtterance = () => {
            return new Promise((resolve, reject) => {
                const utterance = new window.SpeechSynthesisUtterance("code is en715 amazing singer");
                utterance.rate = 0.7;
                utterance.onend = resolve;
                utterance.onerror = reject;
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            });
        };
        tellAnswer();
    }, [correctSongFound]);


    const buttonStyle = {
        width: '10vw',  // Adjust the width based on the viewport width
        height: '10vw', // Adjust the height based on the viewport width
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>

            <p>{statusText}</p>

            {!recording && (
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