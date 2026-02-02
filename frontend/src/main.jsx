import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import PlayerPrivateView from './PlayerPrivateView.jsx';
import DataEditor from './components/DataEditor.jsx';
import MobPresetsEditor from './components/MobPresetsEditor.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/p/:token" element={<PlayerPrivateView />} />
        <Route path="/editor" element={<DataEditor />} />
        <Route path="/mobs" element={<MobPresetsEditor />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
