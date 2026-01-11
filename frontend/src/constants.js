import { 
  ArrowDownCircle, Link as LinkIcon, ZapOff, Skull, 
  FlaskConical, Ghost, Heart, EyeOff, Cloud, Moon, Timer 
} from 'lucide-react';

export const CONDITIONS = [
  { id: 'prone', label: 'Caído', icon: ArrowDownCircle, color: 'text-amber-500' },
  { id: 'restrained', label: 'Impedido', icon: LinkIcon, color: 'text-zinc-400' },
  { id: 'paralyzed', label: 'Paralisado', icon: ZapOff, color: 'text-blue-500' },
  { id: 'incapacitated', label: 'Incapacitado', icon: Skull, color: 'text-red-500' },
  { id: 'poisoned', label: 'Envenenado', icon: FlaskConical, color: 'text-green-500' },
  { id: 'frightened', label: 'Amedrontado', icon: Ghost, color: 'text-purple-500' },
  { id: 'charmed', label: 'Enfeitiçado', icon: Heart, color: 'text-pink-500' },
  { id: 'blinded', label: 'Cego', icon: EyeOff, color: 'text-gray-600' },
  { id: 'invisible', label: 'Invisível', icon: Cloud, color: 'text-cyan-400' },
  { id: 'unconscious', label: 'Inconsciente', icon: Moon, color: 'text-indigo-500' },
  { id: 'exhausted', label: 'Exausto', icon: Timer, color: 'text-orange-500' },
];

export const BACKEND_URL = `http://${window.location.hostname}:3333`;

export const getImageUrl = (path) => path ? `${BACKEND_URL}${path}` : '';
