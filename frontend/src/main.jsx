import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import PlayerPrivateView from './PlayerPrivateView.jsx';
import DataEditor from './components/DataEditor.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/p/:token" element={<PlayerPrivateView />} />
        <Route path="/editor" element={<DataEditor />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
