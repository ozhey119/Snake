import React, { useEffect, useState, useRef } from "react";
import { useInterval } from "./useInterval";
import {
    CANVAS_SIZE,
    SNAKE_START,
    APPLE_START,
    SCALE,
    SPEED,
    DIRECTIONS
} from './constants'
import './App.css'

const App = () => {
    const canvasRef = useRef(null)
    const [snake, setSnake] = useState(SNAKE_START);
    const [dir, setDir] = useState([0, -1]);
    const [apple, setApple] = useState(APPLE_START);
    const [speed, setSpeed] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const startGame = () => {
        setSnake(SNAKE_START);
        setApple(APPLE_START);
        setDir([0, -1]);
        setSpeed(SPEED);
        setScore(0);
        setGameOver(false);
    }

    const endGame = () => {
        setSpeed(null);
        setGameOver(true);
    }

    const moveSnake = ({ keyCode }) => {
        if (keyCode >= 37 && keyCode <= 40) {
            setDir(DIRECTIONS[keyCode])
        }
    }

    const createApple = () => {
        return apple.map((_, i) => Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)));
    }

    const checkCollision = (piece, snk = snake) => {
        if (
            piece[0] * SCALE >= CANVAS_SIZE[0] ||
            piece[0] < 0 ||
            piece[1] * SCALE >= CANVAS_SIZE[1] ||
            piece[1] < 0
        ) {
            return true;
        }

        for (const segment of snk) {
            if (piece[0] === segment[0] && piece[1] === segment[1]) {
                return true;
            }
        }

        return false;
    }

    const checkAppleEat = (newSnake) => {
        if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
            setScore(prevScore => prevScore + 1)
            setSpeed(Math.max(SPEED - score * 3, 100));
            let newApple = createApple();
            while (checkCollision(newApple, newSnake)) { //make sure the new apple doesn't collide with the snake
                newApple = createApple();
            }
            setApple(newApple);
            return true;
        }
        return false;
    }

    const gameLoop = () => {
        const snakeCopy = JSON.parse(JSON.stringify(snake));
        let newSnakeHead = [snakeCopy[0][0] + dir[0], snakeCopy[0][1] + dir[1]];
        // prevents reverse situation
        if (newSnakeHead[0] === snakeCopy[1][0] && newSnakeHead[1] === snakeCopy[1][1]) {
            newSnakeHead = [snakeCopy[0][0] - dir[0], snakeCopy[0][1] - dir[1]];
        }
        if (checkCollision(newSnakeHead)) {
            endGame();
            return;
        }
        snakeCopy.unshift(newSnakeHead);
        if (!checkAppleEat(snakeCopy)) { //only pop the tail if an apple wasn't eaten.
            snakeCopy.pop();
        }
        setSnake(snakeCopy);
    }

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    }, [])

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);
        context.fillStyle = "aliceblue";
        context.fillRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);
        context.fillStyle = "limeGreen";
        snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1))
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(apple[0] + 0.5, apple[1] + 0.575, 0.425, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.fillStyle = 'green';
        context.fillRect(apple[0] + 0.5, apple[1], 0.3, 0.15);
    }, [snake, apple, gameOver])

    useInterval(gameLoop, speed);

    return (
        <div className='snake-game'>
            <div role="button" tabIndex="0" onKeyDown={e => moveSnake(e)} className='snake-container'>
                <canvas
                    className='snake-canvas'
                    ref={canvasRef}
                    width={`${CANVAS_SIZE[0]}px`}
                    height={`${CANVAS_SIZE[1]}px`} />
                <button onClick={startGame} className='button-red'>Start Game</button>
                {!gameOver ? <h2>Score: {score}</h2> : ''}
                {gameOver && <h2> Game Over! Your score is {score}. </h2>}
            </div>
        </div>
    )
}

export default App;