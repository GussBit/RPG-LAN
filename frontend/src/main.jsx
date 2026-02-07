import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { Loader2 } from 'lucide-react';

const App = lazy(() => import('./App.jsx'));
const PlayerPrivateView = lazy(() => import('./PlayerPrivateView.jsx'));
const DataEditor = lazy(() => import('./components/DataEditor.jsx'));
const MobPresetsEditor = lazy(() => import('./components/MobPresetsEditor.jsx'));

const LoadingFallback = () => (
  <div className="h-screen flex items-center justify-center bg-zinc-950 text-indigo-500">
    <Loader2 className="animate-spin w-12 h-12" />
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/p/:token" element={<PlayerPrivateView />} />
          <Route path="/editor" element={<DataEditor />} />
          <Route path="/mobs" element={<MobPresetsEditor />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);
