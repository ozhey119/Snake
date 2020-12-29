const CANVAS_SIZE = [360, 360];
const SNAKE_START = [
  [8, 7],
  [8, 8]
];

const SNAKE_START2 = [
    [16, 7],
    [16, 8]
  ];
const APPLE_START = [8, 3];
const SCALE = 20;
const SPEED = 180;
const DIRECTIONS = {
  38: [0, -1], // up
  40: [0, 1], // down
  37: [-1, 0], // left
  39: [1, 0] // right
};

export {
  CANVAS_SIZE,
  SNAKE_START,
  SNAKE_START2,
  APPLE_START,
  SCALE,
  SPEED,
  DIRECTIONS
};