import React, {useCallback, useState} from 'react';
import WebCameraHook from "./components/WebCameraHook";
import './App.css';


function App() {
  const [startStream, setStartStream] = useState<boolean>(false);
  const webCameraCallback = useCallback((event: any) => {

  }, []);
  const {
    mediaRecorderStart,
    mediaRecorderStop,
    mediaStreamStop,
    videoRef,
  } = WebCameraHook({streamRecorderCallback: webCameraCallback, startStream});

  return (
    <div className="App">
      <video ref={videoRef}/>
    </div>
  );
}

export default App;
