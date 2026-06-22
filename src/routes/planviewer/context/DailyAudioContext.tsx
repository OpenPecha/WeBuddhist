import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import DownloadAppAudioModal from "../components/DownloadAppAudioModal.tsx";

type PauseFn = () => void;

type DailyAudioContextValue = {
  requestPlay: (audioId: string, play: () => void) => void;
  registerPause: (audioId: string, pause: PauseFn) => void;
  unregisterPause: (audioId: string) => void;
  notifyPlaying: (audioId: string) => void;
  notifyPaused: (audioId: string) => void;
  isPlaying: (audioId: string) => boolean;
  isPrimaryAudio: (audioId: string) => boolean;
};

const DailyAudioContext = createContext<DailyAudioContextValue | null>(null);

type DailyAudioProviderProps = {
  children: ReactNode;
  primaryAudioId: string | null;
  dayKey: string;
};

export function DailyAudioProvider({
  children,
  primaryAudioId,
  dayKey,
}: DailyAudioProviderProps) {
  const [showModal, setShowModal] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const pauseRegistry = useRef(new Map<string, PauseFn>());
  const pendingPlayRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setPlayingId(null);
    setShowModal(false);
    pendingPlayRef.current = null;
  }, [dayKey]);

  const pauseAllExcept = useCallback((exceptId: string) => {
    pauseRegistry.current.forEach((pause, id) => {
      if (id !== exceptId) pause();
    });
  }, []);

  const registerPause = useCallback((audioId: string, pause: PauseFn) => {
    pauseRegistry.current.set(audioId, pause);
  }, []);

  const unregisterPause = useCallback((audioId: string) => {
    pauseRegistry.current.delete(audioId);
  }, []);

  const notifyPlaying = useCallback((audioId: string) => {
    setPlayingId(audioId);
  }, []);

  const notifyPaused = useCallback((audioId: string) => {
    setPlayingId((current) => (current === audioId ? null : current));
  }, []);

  const isPrimaryAudio = useCallback(
    (audioId: string) => primaryAudioId !== null && audioId === primaryAudioId,
    [primaryAudioId],
  );

  const requestPlay = useCallback(
    (audioId: string, play: () => void) => {
      if (playingId === audioId) {
        pauseRegistry.current.get(audioId)?.();
        return;
      }

      const startPlay = () => {
        pauseAllExcept(audioId);
        play();
      };

      if (isPrimaryAudio(audioId)) {
        startPlay();
        return;
      }

      pendingPlayRef.current = startPlay;
      setShowModal(true);
    },
    [isPrimaryAudio, pauseAllExcept, playingId],
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    const play = pendingPlayRef.current;
    pendingPlayRef.current = null;
    play?.();
  }, []);

  const value = useMemo(
    () => ({
      requestPlay,
      registerPause,
      unregisterPause,
      notifyPlaying,
      notifyPaused,
      isPlaying: (audioId: string) => playingId === audioId,
      isPrimaryAudio,
    }),
    [
      requestPlay,
      registerPause,
      unregisterPause,
      notifyPlaying,
      notifyPaused,
      playingId,
      isPrimaryAudio,
    ],
  );

  return (
    <DailyAudioContext.Provider value={value}>
      {children}
      <DownloadAppAudioModal open={showModal} onClose={handleModalClose} />
    </DailyAudioContext.Provider>
  );
}

export function useDailyAudioContext() {
  const context = useContext(DailyAudioContext);
  if (!context) {
    throw new Error(
      "useDailyAudioContext must be used within DailyAudioProvider",
    );
  }
  return context;
}

export function useDailyAudioPlay(
  audioId: string,
  audioUrl: string | undefined,
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const {
    requestPlay,
    registerPause,
    unregisterPause,
    notifyPlaying,
    notifyPaused,
  } = useDailyAudioContext();

  useEffect(() => {
    if (!audioUrl) return;
    registerPause(audioId, () => {
      audioRef.current?.pause();
    });
    return () => unregisterPause(audioId);
  }, [audioId, audioUrl, registerPause, unregisterPause]);

  const play = useCallback(() => {
    void audioRef.current?.play();
  }, []);

  const handlePlayClick = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      if (!audioUrl) return;
      requestPlay(audioId, play);
    },
    [audioId, audioUrl, play, requestPlay],
  );

  return {
    audioRef,
    playing,
    audioUrl,
    handlePlayClick,
    onPlay: () => {
      setPlaying(true);
      notifyPlaying(audioId);
    },
    onPause: () => {
      setPlaying(false);
      notifyPaused(audioId);
    },
    onEnded: () => {
      setPlaying(false);
      notifyPaused(audioId);
    },
  };
}
