import { createRoot } from 'react-dom/client'
import '@fontsource/archivo-black'
import '@fontsource-variable/ibm-plex-sans'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
