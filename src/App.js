import React, { useEffect, useState, useRef } from "react";
import socketIOClient from "socket.io-client";
import { useInterval } from "./useInterval";
import {
    CANVAS,
    SNAKE_START,
    SCALE,
    INTERVAL,
    BASE_SPEED,
    MAX_SPEED,
    DIRECTIONS,
    API_ENDPOINT
} from './constants'
import './App.css'

const createApple = () => {
    return {
        x: Math.floor(Math.random() * (CANVAS.width / SCALE)),
        y: Math.floor(Math.random() * (CANVAS.height / SCALE))
    }
}

const App = () => {
    const canvasRef = useRef(null)
    const [snakes, setSnakes] = useState(SNAKE_START);
    const [apple, setApple] = useState({});
    const [gameOver, setGameOver] = useState(false);
    const [delay, setDelay] = useState(null);
    const [time, setTime] = useState(0);
    const [response, setResponse] = useState("");


    const startGame = () => {
        setSnakes(SNAKE_START);
        let newApple = createApple();
        while (checkCollision(newApple)) { //make sure the new apple doesn't collide with the snakes
            newApple = createApple();
        }
        setApple(newApple);
        setGameOver(false);
        setDelay(INTERVAL);
    }

    const endGame = (message) => {
        setDelay(null);
        setGameOver(message);
    }

    const moveSnake = ({ keyCode }) => {
        if (keyCode >= 37 && keyCode <= 40) { //first snake keycodes
            setSnakes(prevSnakes => {
                prevSnakes[0].dir = DIRECTIONS[keyCode];
                return prevSnakes;
            })
        }
        if (snakes.length > 1 && (keyCode === 87 || keyCode === 65 || keyCode === 83 || keyCode === 68)) {
            setSnakes(prevSnakes => {
                prevSnakes[1].dir = DIRECTIONS[keyCode];
                return prevSnakes;
            })
        }
    }



    const checkCollision = (piece) => {
        if (
            piece.x * SCALE >= CANVAS.width ||
            piece.x < 0 ||
            piece.y * SCALE >= CANVAS.height ||
            piece.y < 0
        ) {
            return true;
        }

        for (const snk of snakes) {
            for (const segment of snk.body) {
                if (piece.x === segment.x && piece.y === segment.y) {
                    return true;
                }
            }
        }

        return false;
    }

    // checks if there's a collision between new heads
    const checkNewHeadsCollision = (newSnakes) => {
        for (const [i, snk] of newSnakes.entries()) {
            for (const [j, snk2] of newSnakes.entries()) {
                if (snk.body[0].x === snk2.body[0].x && snk.body[0].y === snk2.body[0].y && i !== j) {
                    return [snk.color, snk2.color];
                }
            }
        }
        return false;
    }

    const checkAppleEat = (newSnake) => {
        if (newSnake[0].x === apple.x && newSnake[0].y === apple.y) {
            let newApple = createApple();
            while (checkCollision(newApple)) { //make sure the new apple doesn't collide with the snake
                newApple = createApple();
            }
            setApple(newApple);
            return true;
        }
        return false;
    }

    const gameLoop = () => {
        const newSnakes = [];
        for (const snake of snakes) {
            const snakeCopy = JSON.parse(JSON.stringify(snake));
            if (time % snake.speed === 0) {
                let newSnakeHead = {
                    x: snakeCopy.body[0].x + snakeCopy.dir.x,
                    y: snakeCopy.body[0].y + snakeCopy.dir.y
                }
                // prevents reverse situation
                if (newSnakeHead.x === snakeCopy.body[1].x && newSnakeHead.y === snakeCopy.body[1].y) {
                    newSnakeHead = {
                        x: snakeCopy.body[0].x - snakeCopy.dir.x,
                        y: snakeCopy.body[0].y - snakeCopy.dir.y
                    }
                }
                if (checkCollision(newSnakeHead)) {
                    // endGame('snake ' + snakeCopy.color + ' lost');
                    console.log('snake ' + snakeCopy.color + ' collided')
                    snakeCopy.speed = Infinity;
                    newSnakes.push(snakeCopy);
                    continue;
                }
                snakeCopy.body.unshift(newSnakeHead);
                if (!checkAppleEat(snakeCopy.body)) { //only pop the tail if an apple wasn't eaten.
                    snakeCopy.body.pop();
                } else { // if the snake ate an apple, increase score and speed
                    snakeCopy.score += 1;
                    snakeCopy.speed = Math.max(
                        (snakeCopy.score % 5 === 0) ? BASE_SPEED - snakeCopy.score * 8 : snakeCopy.speed,
                        MAX_SPEED
                    )
                }
            }
            newSnakes.push(snakeCopy);
        }
        setSnakes(newSnakes);
        const headCollisionResult = checkNewHeadsCollision(newSnakes);
        if (headCollisionResult) {
            endGame(`snakes ${headCollisionResult[0]} and ${headCollisionResult[1]} collided`);
            return;
        }
        setTime(prevTime => prevTime + INTERVAL)
    }

    useEffect(() => {
        const socket = socketIOClient(API_ENDPOINT);

        socket.on('connect', function () {
            console.log('connected')
        });

        socket.on("FromAPI", data => {
            setResponse(data);
        });

        // cleanup
        return () => socket.disconnect();
    }, []);

    useEffect(() => {

    }, [response])

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    }, [])

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        context.fillStyle = CANVAS.color;
        context.fillRect(0, 0, CANVAS.width, CANVAS.height);
        snakes.forEach(snake => {
            context.fillStyle = snake.color;
            snake.body.forEach((segment) => context.fillRect(segment.x, segment.y, 1, 1))
        })
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(apple.x + 0.5, apple.y + 0.575, 0.425, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.fillStyle = 'green';
        context.fillRect(apple.x + 0.5, apple.y, 0.3, 0.15);
    }, [snakes, apple, gameOver])

    useInterval(gameLoop, delay);

    const scores = snakes.map((snake) => <h2 key={snake.color}>{`${snake.color}'s score: ${snake.score}`}</h2>)

    return (
        <div className='snake-game'>
            <div role="button" tabIndex="0" onKeyDown={e => moveSnake(e)} className='snake-container'>
                <canvas
                    className='snake-canvas'
                    ref={canvasRef}
                    width={`${CANVAS.width}px`}
                    height={`${CANVAS.height}px`} />
                <button onClick={startGame} className='button-red'>Start Game</button>
                {!gameOver ? scores : ''}
                {gameOver && <h2> Game Over! {gameOver}. </h2>}
            </div>
        </div>
    )
}

export default App;