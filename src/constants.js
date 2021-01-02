const CANVAS = {
    width: 360,
    height: 360,
    color: "aliceblue"
}
const APPLE_START = { x: 6, y: 3 };
const SCALE = 20;
const INTERVAL = 20;
const BASE_SPEED = 160;
const MAX_SPEED = 80;
const DIRECTIONS = {
    38: { x: 0, y: -1 }, //up
    40: { x: 0, y: 1 }, //down
    37: { x: -1, y: 0 }, //left
    39: { x: 1, y: 0 }, //right
    87: { x: 0, y: -1 }, //up
    83: { x: 0, y: 1 }, //down
    65: { x: -1, y: 0 }, //left
    68: { x: 1, y: 0 } //right
};
const SNAKE_START =
    [
        {
            body: [
                { x: 4, y: 7 },
                { x: 4, y: 8 }
            ],
            speed: BASE_SPEED,
            color: "limeGreen",
            score: 0,
            dir: DIRECTIONS[38]
        },
        {
            body: [
                { x: 8, y: 7 },
                { x: 8, y: 8 }
            ],
            speed: BASE_SPEED,
            color: "DarkSlateBlue",
            score: 0,
            dir: DIRECTIONS[38]
        }
    ];
const API_ENDPOINT = "http://localhost:3001/";

export {
    CANVAS,
    SNAKE_START,
    APPLE_START,
    SCALE,
    INTERVAL,
    BASE_SPEED,
    MAX_SPEED,
    DIRECTIONS,
    API_ENDPOINT
};