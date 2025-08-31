import { useState } from 'react';
import { Html } from '@react-three/drei';

interface DoorProps {
  position: [number, number, number];
  onUnlock: () => void;
}

const Door = ({ position, onUnlock }: DoorProps) => {
  const [input, setInput] = useState('');
  const [showError, setShowError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedInput = input.toLowerCase().replace(/\s+/g, '');
    
    if (normalizedInput === 'g35' || normalizedInput === 'g-35') {
      setIsUnlocked(true);
      onUnlock();
      setTimeout(() => {
        setInput('');
      }, 500);
    } else {
      setShowError(true);
      setInput('');
      setTimeout(() => setShowError(false), 2000);
    }
  };

  if (isUnlocked) return null;

  return (
    <group position={position}>
      <Html center transform rotation={[0, Math.PI / 2, 0]}>
        <div className="flex flex-col items-center gap-2 select-none">
          <div 
            className="text-white text-2xl font-bold px-4 py-2 bg-black bg-opacity-70 rounded"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
          >
            (სასწაული კარი)
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter password..."
              className="px-3 py-1 rounded bg-white bg-opacity-90 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
            
            {showError && (
              <div className="text-red-500 font-bold text-sm bg-white bg-opacity-90 px-2 py-1 rounded">
                Wrong! Try again!
              </div>
            )}
          </form>
        </div>
      </Html>
    </group>
  );
};

export default Door;