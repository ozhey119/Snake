import React, { useEffect, useState, useRef, useCallback } from "react";
import socketIOClient from "socket.io-client";
import { useSwipeable } from "react-swipeable";
import { useWindowDimensions } from './customHooks';
import Scores from './Scores';
import './App.css'
const MAX_WINDOW_WIDTH = 600; //The true maximum width is around 80% of the const value

const App = () => {
    const canvasRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [gameState, setGameState] = useState();
    const [canvas, setCanvas] = useState({ width: 480, height: 480, color: "oldlace", scale: 20 })
    const [roomName, setRoomName] = useState();
    const [mode, setMode] = useState();
    const [roomInput, setRoomInput] = useState('');
    const [winner, setWinner] = useState();
    const socketRef = useRef();
    const { height, width } = useWindowDimensions();
    let options, gameBoard, currentSnakeColor, gameResult;

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => handleKeyDown({ key: "ArrowLeft" }),
        onSwipedRight: () => handleKeyDown({ key: "ArrowRight" }),
        onSwipedUp: () => handleKeyDown({ key: "ArrowUp" }),
        onSwipedDown: () => handleKeyDown({ key: "ArrowDown" })
    });

    const reset = () => {
        setRoomName();
        setGameState();
        setWinner();
        setMode();
        setWinner();
    }

    useEffect(() => {
        socketRef.current = socketIOClient("https://lit-caverns-07351.herokuapp.com");
        socketRef.current.on('connect', function () {
            setIsConnected(true);
        });
        socketRef.current.on('disconnect', function () {
            setIsConnected(false);
            reset();
        });
        socketRef.current.on('gameState', (state) => {
            setGameState(state);
        })
        socketRef.current.on('gameEnd', (state) => {
            if (Object.keys(state.snakes).length > 1) {
                if (state.hasOwnProperty('lastSurvivor') && Object.keys(state.snakes).length > 1) {
                    setWinner(state.lastSurvivor);
                } else {
                    setWinner('Tie');
                }
            }
        })
        socketRef.current.on('initGame', (initCanvas) => {
            setWinner();
            const maxWidth = Math.min(window.innerWidth, MAX_WINDOW_WIDTH);
            const multiplier = initCanvas.width / maxWidth;
            setCanvas({
                width: maxWidth * 0.8,
                height: initCanvas.height / multiplier * 0.8,
                color: initCanvas.color,
                scale: initCanvas.scale / multiplier * 0.8
            })
        })
        socketRef.current.on('joinedRoom', (roomName) => {
            setRoomName(roomName);
        })
        socketRef.current.on('leftRoom', () => {
            reset();
        })
        return () => socketRef.current.disconnect();
    }, []);

    const initBlankCanvas = useCallback(
        () => {
            const context = canvasRef.current.getContext("2d");
            context.fillStyle = canvas.color;
            context.fillRect(0, 0, canvas.width, canvas.height);
            return context;
        },
        [canvas],
    );

    useEffect(() => {
        setCanvas(prevCanvas => {
            const maxWidth = Math.min(width, MAX_WINDOW_WIDTH);
            const multiplier = prevCanvas.width / maxWidth;
            return {
                width: maxWidth * 0.8,
                height: prevCanvas.height / multiplier * 0.8,
                color: prevCanvas.color,
                scale: prevCanvas.scale / multiplier * 0.8
            }
        })
    }, [width, height])

    useEffect(() => {
        const context = initBlankCanvas();
        context.setTransform(canvas.scale, 0, 0, canvas.scale, 0, 0);
    }, [canvas, initBlankCanvas, mode])

    useEffect(() => {
        if (gameState) {
            const { snakes, apple } = gameState;
            const context = initBlankCanvas();
            Object.values(snakes).forEach(snake => {
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
        }
    }, [gameState, canvas, initBlankCanvas])

    const handleKeyDown = (e) => {
        if (e.code === "Space") {
            socketRef.current.emit('newGame', roomName, mode)
        } else {
            if (e.preventDefault && (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
                e.preventDefault();
            }
            socketRef.current.emit('keyDown', e.code, roomName)
        }
    }

    const handleJoinRoom = (room, mode) => {
        setMode(mode);
        socketRef.current.emit('joinRoom', room, mode);
    }

    if (mode === 'room' && gameState && gameState.snakes[socketRef.current.id]) {
        currentSnakeColor = <h2 style={{ margin: '10px 0px -15px' }} className='text-shadow'>Your color is <span style={{ color: gameState.snakes[socketRef.current.id].color }}>{gameState.snakes[socketRef.current.id].color}</span></h2>
    }

    if (roomName) { // Player entered a room or chose local mode
        options = <div className='options'>
            <button
                onClick={() => socketRef.current.emit('newGame', roomName, mode)}
                className='button-red'>Start game
            </button>
            <button
                onClick={() => socketRef.current.emit('leaveRoom', roomName)}
                className='button-red'>Back to menu
            </button>
        </div>
    } else {
        options = <div className='options center'>
            <h1 className='title text-shadow'>Snake</h1>
            <button
                onClick={() => handleJoinRoom(socketRef.current.id, 'solo')}
                className='button-red'>
                Solo
            </button>
            <button
                onClick={() => handleJoinRoom(socketRef.current.id, 'local2p')}
                className='button-red'>
                Local 2 players
            </button>
            <input type="text" placeholder="Room name" onChange={(e) => setRoomInput(e.target.value)} />
            <button
                onClick={() => handleJoinRoom(roomInput, 'room')}
                className='button-red'>
                Enter room
            </button>
            {isConnected ? <div className='good'>connected</div> : 
            <div className='bad'>connecting...</div>}
        </div>
    }
    if (winner === 'Tie') {
        gameResult = <h2 className='text-shadow'>The game ended with a tie!</h2>
    } else if (winner) {
        gameResult = <h2 className='text-shadow'>The last survivor is <span style={{ color: winner }}>{winner}</span></h2>
    }

    return (
        <div className='snake-game'>
            <div role="button" tabIndex="0" onKeyDown={handleKeyDown} {...swipeHandlers} className='snake-container'>
                {currentSnakeColor}
                {gameBoard}
                <canvas style={roomName ? { display: 'block' } : { display: 'none' }}
                    className='snake-canvas'
                    ref={canvasRef}
                    width={`${canvas.width}px`}
                    height={`${canvas.height}px`}
                />
                {options}
                {gameResult}
                <Scores gameState={gameState} />
            </div>
        </div>
    )
}

export default App;