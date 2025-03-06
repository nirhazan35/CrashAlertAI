import playBeep from "../../util/generateSound";

describe('playBeep function', () => {
  let originalAudioContext;
  let mockOscillator;
  let mockAudioContext;

  beforeEach(() => {
    // Save original AudioContext
    originalAudioContext = window.AudioContext;

    // Create mock oscillator with spy methods
    mockOscillator = {
      type: '',
      frequency: {
        setValueAtTime: jest.fn()
      },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    };

    // Create mock AudioContext
    mockAudioContext = {
      createOscillator: jest.fn(() => mockOscillator),
      currentTime: 0,
      destination: {}
    };

    // Mock the AudioContext constructor
    window.AudioContext = jest.fn(() => mockAudioContext);
    window.webkitAudioContext = jest.fn(() => mockAudioContext);

    // Mock setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore original AudioContext
    window.AudioContext = originalAudioContext;
    window.webkitAudioContext = originalAudioContext;

    // Restore real timers
    jest.useRealTimers();
  });

  test('should create an oscillator with the correct properties', () => {
    // Call the function
    playBeep();

    // Check that AudioContext was created
    expect(window.AudioContext).toHaveBeenCalledTimes(1);

    // Check that oscillator was created
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);

    // Check oscillator properties
    expect(mockOscillator.type).toBe('sine');
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
    expect(mockOscillator.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    expect(mockOscillator.start).toHaveBeenCalledTimes(1);
  });

  test('should stop the oscillator after 500ms', () => {
    // Call the function
    playBeep();

    // Initially, stop should not have been called
    expect(mockOscillator.stop).not.toHaveBeenCalled();

    // Fast-forward time by 499ms
    jest.advanceTimersByTime(499);
    expect(mockOscillator.stop).not.toHaveBeenCalled();

    // Fast-forward time to exactly 500ms
    jest.advanceTimersByTime(1);
    expect(mockOscillator.stop).toHaveBeenCalledTimes(1);
  });

  test('should prefer standard AudioContext if available', () => {
    // Make both contexts available
    window.AudioContext = jest.fn(() => mockAudioContext);
    window.webkitAudioContext = jest.fn(() => ({})); // Different object

    // Call the function
    playBeep();

    // Standard AudioContext should be used
    expect(window.AudioContext).toHaveBeenCalledTimes(1);
    expect(window.webkitAudioContext).not.toHaveBeenCalled();
  });

  test('should fall back to webkitAudioContext if standard is not available', () => {
    // Make only webkit context available
    window.AudioContext = undefined;
    window.webkitAudioContext = jest.fn(() => mockAudioContext);

    // Call the function
    playBeep();

    // Webkit AudioContext should be used
    expect(window.webkitAudioContext).toHaveBeenCalledTimes(1);
  });
});