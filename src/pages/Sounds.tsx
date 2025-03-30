import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface Sound {
  name: string;
  file: string;
  isPlaying: boolean;
  volume: number;
}

function Sounds() {
  const [sounds, setSounds] = useState<Sound[]>([
    { name: 'Rain Noise', file: '/Sounds/Rain Noise.MP3', isPlaying: false, volume: 0.5 },
    { name: 'Dark Noise', file: '/Sounds/Dark Noise.MP3', isPlaying: false, volume: 0.5 }
  ]);

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  useEffect(() => {
    // Initialize audio refs
    audioRefs.current = sounds.map(() => new Audio());
    sounds.forEach((sound, index) => {
      if (audioRefs.current[index]) {
        audioRefs.current[index]!.src = sound.file;
        audioRefs.current[index]!.loop = true;
        audioRefs.current[index]!.volume = sound.volume;
      }
    });

    // Cleanup on unmount
    return () => {
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const togglePlay = (index: number) => {
    const audio = audioRefs.current[index];
    if (!audio) return;

    setSounds(prevSounds => {
      const newSounds = [...prevSounds];
      newSounds[index] = {
        ...newSounds[index],
        isPlaying: !newSounds[index].isPlaying
      };
      return newSounds;
    });

    if (sounds[index].isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleVolumeChange = (index: number, value: number) => {
    const audio = audioRefs.current[index];
    if (!audio) return;

    const newVolume = value / 100;
    audio.volume = newVolume;

    setSounds(prevSounds => {
      const newSounds = [...prevSounds];
      newSounds[index] = {
        ...newSounds[index],
        volume: newVolume
      };
      return newSounds;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Ambient Sounds</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {sounds.map((sound, index) => (
            <div
              key={sound.name}
              className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">{sound.name}</h2>
                <button
                  onClick={() => togglePlay(index)}
                  className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  {sound.isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-white" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sound.volume * 100}
                  onChange={(e) => handleVolumeChange(index, Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sounds;