import { useRef, useState } from "react";
import { IoPause, IoPlay } from "react-icons/io5";

type SubtaskAudioPlayProps = {
  audioUrl: string;
  label?: string;
};

const SubtaskAudioPlay = ({
  audioUrl,
  label = "Play audio",
}: SubtaskAudioPlayProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      return;
    }
    void audio.play();
  };

  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        type="button"
        onClick={togglePlayback}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition hover:bg-stone-800"
        aria-label={playing ? "Pause audio" : label}
      >
        {playing ? (
          <IoPause className="text-lg" aria-hidden="true" />
        ) : (
          <IoPlay className="ml-0.5 text-lg" aria-hidden="true" />
        )}
      </button>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      >
        <track kind="captions" />
      </audio>
    </div>
  );
};

export default SubtaskAudioPlay;
