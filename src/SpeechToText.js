import React, { useState } from 'react';

function SpeechToText() {
  const [isMicrophoneEnabled, setMicrophoneEnabled] = useState(false);

  const toggleMicrophone = () => {
    setMicrophoneEnabled(!isMicrophoneEnabled);
  };

  const speakText = () => {
    const utterance = new window.SpeechSynthesisUtterance("code is en715 amazing singer");
    utterance.rate = 0.7;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };



  return (
    <div>
      <button onClick={toggleMicrophone}>
        {isMicrophoneEnabled ? 'Disable Microphone' : 'Enable Microphone'}
      </button>
      <button onClick={speakText}>Speak</button>

    </div>
  );
}

export default SpeechToText;
