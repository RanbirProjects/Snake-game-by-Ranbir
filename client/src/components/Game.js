import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px #4CAF50; }
  50% { box-shadow: 0 0 20px #4CAF50; }
  100% { box-shadow: 0 0 5px #4CAF50; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #1a1a1a;
  height: 100vh;
  width: 100vw;
  color: white;
  animation: ${fadeIn} 1s ease-in;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
`;

const GameBoard = styled.div`
  width: 600px;
  height: 600px;
  background-color: #2a2a2a;
  border: 3px solid #4CAF50;
  position: relative;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
  animation: ${glow} 2s infinite;
  margin: 20px auto;
`;

const SnakeHead = styled.div`
  width: 20px;
  height: 20px;
  background-color: #4CAF50;
  position: absolute;
  border-radius: 4px;
  z-index: 2;
  transition: all 0.1s ease;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background-color: white;
    border-radius: 50%;
    top: 3px;
    animation: ${pulse} 1s infinite;
  }
  
  &::before {
    left: 3px;
  }
  
  &::after {
    right: 3px;
  }
`;

const SnakeBody = styled.div`
  width: 20px;
  height: 20px;
  background-color: #45a049;
  position: absolute;
  border-radius: 2px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
  transition: all 0.1s ease;
`;

const Food = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${props => props.type === 'special' ? '#FFD700' : '#f44336'};
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 10px ${props => props.type === 'special' ? '#FFD700' : '#f44336'};
  animation: ${pulse} 1s infinite;
  
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
    animation: ${rotate} 2s linear infinite;
  }
`;

const Obstacle = styled.div`
  width: 20px;
  height: 20px;
  background-color: #666;
  position: absolute;
  border-radius: 2px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
  animation: ${glow} 2s infinite;
`;

const ScoreBoard = styled.div`
  margin: 20px 0;
  font-size: 24px;
  font-weight: bold;
  color: #4CAF50;
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
  animation: ${glow} 2s infinite;
`;

const LevelUp = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 20px;
  border-radius: 10px;
  font-size: 24px;
  font-weight: bold;
  animation: ${fadeIn} 0.5s ease-in, ${pulse} 1s infinite;
  z-index: 3;
`;

const GameOver = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  border: 2px solid #4CAF50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
  animation: ${fadeIn} 0.5s ease-in, ${shake} 0.5s ease-in;
`;

const Button = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px;
  transition: all 0.3s ease;
  animation: ${glow} 2s infinite;

  &:hover {
    background-color: #45a049;
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
  }
`;

const ScorePopup = styled.div`
  position: absolute;
  color: #4CAF50;
  font-weight: bold;
  font-size: 20px;
  pointer-events: none;
  animation: ${fadeIn} 0.5s ease-out, ${pulse} 1s infinite;
  z-index: 3;
`;

const Game = () => {
  const [snake, setSnake] = useState([[0, 0]]);
  const [food, setFood] = useState({ position: [10, 10], type: 'normal' });
  const [direction, setDirection] = useState('RIGHT');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [highScores, setHighScores] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [speed, setSpeed] = useState(150);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [scorePopups, setScorePopups] = useState([]);

  const generateObstacles = useCallback(() => {
    const newObstacles = [];
    const numObstacles = Math.floor(level * 2);
    
    for (let i = 0; i < numObstacles; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * 30);
        y = Math.floor(Math.random() * 30);
      } while (
        snake.some(segment => segment[0] === x && segment[1] === y) ||
        newObstacles.some(obs => obs[0] === x && obs[1] === y)
      );
      newObstacles.push([x, y]);
    }
    setObstacles(newObstacles);
  }, [snake, level]);

  const generateFood = useCallback(() => {
    let x, y;
    do {
      x = Math.floor(Math.random() * 30);
      y = Math.floor(Math.random() * 30);
    } while (
      snake.some(segment => segment[0] === x && segment[1] === y) ||
      obstacles.some(obs => obs[0] === x && obs[1] === y)
    );
    
    const type = Math.random() < 0.2 ? 'special' : 'normal';
    setFood({ position: [x, y], type });
  }, [snake, obstacles]);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = [...newSnake[0]];

    switch (direction) {
      case 'UP':
        head[1] -= 1;
        break;
      case 'DOWN':
        head[1] += 1;
        break;
      case 'LEFT':
        head[0] -= 1;
        break;
      case 'RIGHT':
        head[0] += 1;
        break;
      default:
        break;
    }

    // Check for collisions
    if (
      head[0] < 0 ||
      head[0] >= 30 ||
      head[1] < 0 ||
      head[1] >= 30 ||
      newSnake.some(segment => segment[0] === head[0] && segment[1] === head[1]) ||
      obstacles.some(obs => obs[0] === head[0] && obs[1] === head[1])
    ) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    // Check if snake ate food
    if (head[0] === food.position[0] && head[1] === food.position[1]) {
      const points = food.type === 'special' ? 30 : 10;
      setScore(prev => prev + points);
      
      // Add score popup
      setScorePopups(prev => [...prev, {
        id: Date.now(),
        points,
        position: [head[0] * 20, head[1] * 20]
      }]);

      // Level up every 100 points
      if ((score + points) % 100 === 0) {
        setLevel(prev => prev + 1);
        setSpeed(prev => Math.max(50, prev - 10));
        generateObstacles();
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2000);
      }
      
      generateFood();
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, generateFood, obstacles, score, generateObstacles]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, speed]);

  const resetGame = () => {
    setSnake([[0, 0]]);
    setDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setLevel(1);
    setSpeed(150);
    generateFood();
    generateObstacles();
  };

  const saveScore = async () => {
    if (!playerName) return;
    try {
      await axios.post('http://localhost:5001/api/scores', {
        playerName,
        score
      });
      fetchHighScores();
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const fetchHighScores = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/scores');
      setHighScores(response.data);
    } catch (error) {
      console.error('Error fetching high scores:', error);
    }
  };

  useEffect(() => {
    fetchHighScores();
    generateObstacles();
  }, []);

  // Remove score popups after animation
  useEffect(() => {
    const timer = setInterval(() => {
      setScorePopups(prev => prev.filter(popup => Date.now() - popup.id < 1000));
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <GameContainer>
      <h1>Snake Game</h1>
      <ScoreBoard>Score: {score} | Level: {level}</ScoreBoard>
      <GameBoard>
        {snake.map((segment, index) => (
          index === 0 ? (
            <SnakeHead
              key={index}
              style={{
                left: `${segment[0] * 20}px`,
                top: `${segment[1] * 20}px`,
                transform: `rotate(${
                  direction === 'UP' ? '0deg' :
                  direction === 'DOWN' ? '180deg' :
                  direction === 'LEFT' ? '270deg' : '90deg'
                })`
              }}
            />
          ) : (
            <SnakeBody
              key={index}
              style={{
                left: `${segment[0] * 20}px`,
                top: `${segment[1] * 20}px`
              }}
            />
          )
        ))}
        <Food
          type={food.type}
          style={{
            left: `${food.position[0] * 20}px`,
            top: `${food.position[1] * 20}px`
          }}
        />
        {obstacles.map((obstacle, index) => (
          <Obstacle
            key={index}
            style={{
              left: `${obstacle[0] * 20}px`,
              top: `${obstacle[1] * 20}px`
            }}
          />
        ))}
        {scorePopups.map(popup => (
          <ScorePopup
            key={popup.id}
            style={{
              left: `${popup.position[0]}px`,
              top: `${popup.position[1] - 20}px`
            }}
          >
            +{popup.points}
          </ScorePopup>
        ))}
        {showLevelUp && (
          <LevelUp>
            Level Up!
          </LevelUp>
        )}
        {gameOver && (
          <GameOver>
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <p>Level Reached: {level}</p>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={{
                padding: '8px',
                margin: '10px 0',
                borderRadius: '4px',
                border: '1px solid #4CAF50'
              }}
            />
            <Button onClick={saveScore}>Save Score</Button>
            <Button onClick={resetGame}>Play Again</Button>
          </GameOver>
        )}
      </GameBoard>
      <div style={{ marginTop: '20px' }}>
        <h2>High Scores</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {highScores.map((score, index) => (
            <li key={index} style={{ margin: '5px 0', color: '#4CAF50' }}>
              {score.playerName}: {score.score}
            </li>
          ))}
        </ul>
      </div>
    </GameContainer>
  );
};

export default Game; 