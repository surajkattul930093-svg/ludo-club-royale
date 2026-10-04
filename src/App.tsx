import React, { useState } from 'react';
import { GameMode } from './types/game';
import { SplashScreen } from './screens/SplashScreen';
import { MainMenu } from './screens/MainMenu';
import { GameScreen } from './screens/GameScreen';
import { AudioService } from './services/AudioService';

type ScreenType = 'splash' | 'menu' | 'game';

import { ErrorBoundary } from './components/ErrorBoundary';
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [gameMode, setGameMode] = useState<GameMode>('pass_and_play');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [animationSpeed, setAnimationSpeed] = useState<number>(140);

  const [selectedColors, setSelectedColors] = useState<PlayerColor[]>([]);
  const [localColor, setLocalColor] = useState<PlayerColor | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);

  const handleToggleSound = () => {
    const updated = !soundEnabled;
    setSoundEnabled(updated);
    AudioService.getInstance().setSoundEnabled(updated);
  };

  const handleStartGame = (mode: GameMode, colors: PlayerColor[] = [], myColor?: PlayerColor, gId?: string) => {
    setGameMode(mode);
    setSelectedColors(colors);
    setLocalColor(myColor || null);
    setGameId(gId || null);
    setCurrentScreen('game');
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {currentScreen === 'splash' && (
        <SplashScreen onFinish={() => setCurrentScreen('menu')} />
      )}

      {currentScreen === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          soundEnabled={soundEnabled}
          animationSpeed={animationSpeed}
          onToggleSound={handleToggleSound}
          onChangeAnimationSpeed={setAnimationSpeed}
        />
      )}

      {currentScreen === 'game' && (
        <GameScreen
          mode={gameMode}
          selectedColors={selectedColors}
          localColor={localColor}
          gameId={gameId}
          onBackToMenu={() => setCurrentScreen('menu')}
          soundEnabled={soundEnabled}
          animationSpeed={animationSpeed}
          onToggleSound={handleToggleSound}
          onChangeAnimationSpeed={setAnimationSpeed}
        />
      )}
    </div>
    </ErrorBoundary>
  );
}


