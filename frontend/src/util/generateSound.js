const playBeep = () => {
  console.log("GENERATING");
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine'; // Options: 'sine', 'square', 'sawtooth', 'triangle'
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Frequency in Hz
  oscillator.connect(audioContext.destination);
  oscillator.start();
  setTimeout(() => oscillator.stop(), 500); // Beep for 300ms
};

export default playBeep;