const playBeep = async () => {
  try {
    // Try to load and play the mp3 file
    console.log('Loading audio file...');
    const audio = new Audio('/alarming-304.mp3');
    console.log('Audio file loaded:', audio);
    
    // Check if the audio file can be loaded
    await new Promise((resolve, reject) => {
      audio.addEventListener('canplay', resolve);
      audio.addEventListener('error', reject);
      audio.load();
    });
    
    // Play the audio twice
    await new Promise((resolve) => {
      let playCount = 0;
      
      const playNext = () => {
        playCount++;
        audio.currentTime = 0; // Reset to beginning
        audio.play();
        
        if (playCount < 2) {
          // Set up for next play
          audio.addEventListener('ended', playNext, { once: true });
        } else {
          resolve();
        }
      };
      
      playNext();
    });
    
  } catch (error) {
    // Fallback to the original beep implementation
    console.log('MP3 file not found or failed to load, using fallback beep');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // Options: 'sine', 'square', 'sawtooth', 'triangle'
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Frequency in Hz
    oscillator.connect(audioContext.destination);
    oscillator.start();
    setTimeout(() => oscillator.stop(), 500); // Beep for 500ms
  }
};

export default playBeep;