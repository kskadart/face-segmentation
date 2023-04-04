import {useEffect, useRef, useState, Dispatch, RefObject, useCallback} from 'react';

interface RecorderHookProps {
  streamRecorderCallback: (event: any) => void;
  startStream: boolean;
}

interface ResultProps {
    mediaRecorderStart: () => void;
    mediaRecorderStop: () => void;
    mediaStreamStop: () => void;
    videoRef: RefObject<HTMLVideoElement>
    playing: boolean;
    setPlaying: Dispatch<boolean>;
    error: string | null;
}

function useWebCamera({
    streamRecorderCallback,
    startStream,
}: RecorderHookProps): ResultProps {
  const mediaRec = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);

  const mediaRecorderStart = useCallback(() => {
      if (mediaRec.current && mediaRec.current.state === 'inactive') {
          mediaRec.current?.start();
          console.log('Media recorder state', mediaRec.current.state);
      }
  }, []);

  const mediaRecorderStop = useCallback(() => {
      console.log('Media recorder state', mediaRec.current?.state);
      if (mediaRec.current && mediaRec.current.state === 'recording') {
          mediaRec.current?.stop();
          console.log('Media recorder state', mediaRec.current.state);
      }
  }, []);

  const mediaStreamStop = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [])

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: {exact: 854},
            height: {exact: 480}
        }
    }).then((stream: MediaStream) => {
      if (!mediaRec.current) {
        // useMediaRecorder(mediaRec, stream, streamRecorderCallback);
        const mediaRecorder = new MediaRecorder(stream, {mimeType: "video/webm; codecs=vp9"});
         mediaRecorder.ondataavailable = streamRecorderCallback;
         mediaRec.current = mediaRecorder;
      }
      const video = videoRef.current;
      if (!video) {
        return;
      }
      else {
        video.srcObject = stream;
        const videoPromise = video.play();
        if (videoPromise !== undefined) {
          videoPromise.then(
            video.oncanplay = () => {
              setPlaying(true);
                const w = video.videoWidth;
                const h = video.videoHeight;
                video.width = w;
                video.height = h;
            }).catch(error => {
              // Auto-play was prevented
              // Show paused UI.
              console.log('Video play error', error);
            })
        }
      }
    }).catch((e: any) => {
      console.log('Init camera error', e);
      setError(e.message);
      setPlaying(false);
    });
  }, [startStream, videoRef]);

  return {mediaRecorderStart, mediaRecorderStop, mediaStreamStop, videoRef, playing, setPlaying, error};
}

export default useWebCamera;
