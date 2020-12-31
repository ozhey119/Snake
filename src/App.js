import React, { useEffect, useState, useRef } from "react";
import { useInterval } from "./useInterval";
import {
    CANVAS,
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
    const [dir, setDir] = useState({ x: 0, y: -1 });
    const [apple, setApple] = useState(APPLE_START);
    const [speed, setSpeed] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const startGame = () => {
        setSnake(SNAKE_START);
        setApple(APPLE_START);
        setDir({ x: 0, y: -1 });
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
        return {
            x: Math.floor(Math.random() * (CANVAS.width / SCALE)),
            y: Math.floor(Math.random() * (CANVAS.height / SCALE))
        }
    }

    const checkCollision = (piece, snk = snake) => {
        if (
            piece.x * SCALE >= CANVAS.width ||
            piece.x < 0 ||
            piece.y * SCALE >= CANVAS.height ||
            piece.y < 0
        ) {
            return true;
        }

        for (const segment of snk) {
            if (piece.x === segment.x && piece.y === segment.y) {
                return true;
            }
        }

        return false;
    }

    const checkAppleEat = (newSnake) => {
        if (newSnake[0].x === apple.x && newSnake[0].y === apple.y) {
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
        let newSnakeHead = {
            x: snakeCopy[0].x + dir.x,
            y: snakeCopy[0].y + dir.y
        }
        // prevents reverse situation
        if (newSnakeHead.x === snakeCopy[1].x && newSnakeHead.y === snakeCopy[1].y) {
            newSnakeHead = {
                x: snakeCopy[0].x - dir.x,
                y: snakeCopy[0].y - dir.y
            }
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
        context.clearRect(0, 0, CANVAS.width, CANVAS.height);
        context.fillStyle = CANVAS.color;
        context.fillRect(0, 0, CANVAS.width, CANVAS.height);
        context.fillStyle = "limeGreen";
        snake.forEach((segment) => context.fillRect(segment.x, segment.y, 1, 1))
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(apple.x + 0.5, apple.y + 0.575, 0.425, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.fillStyle = 'green';
        context.fillRect(apple.x + 0.5, apple.y, 0.3, 0.15);
    }, [snake, apple, gameOver])

    useInterval(gameLoop, speed);

    return (
        <div className='snake-game'>
            <div role="button" tabIndex="0" onKeyDown={e => moveSnake(e)} className='snake-container'>
                <canvas
                    className='snake-canvas'
                    ref={canvasRef}
                    width={`${CANVAS.width}px`}
                    height={`${CANVAS.height}px`} />
                <button onClick={startGame} className='button-red'>Start Game</button>
                {!gameOver ? <h2>Score: {score}</h2> : ''}
                {gameOver && <h2> Game Over! Your score is {score}. </h2>}
            </div>
        </div>
    )
}

export default App;