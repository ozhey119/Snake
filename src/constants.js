const CANVAS = {
  width: 480,
  height: 360,
  color: "aliceblue"
}
const SNAKE_START = 
[
  { x: 8, y: 7 },
  { x: 8, y: 8 }
];
const APPLE_START = { x: 8, y: 3 };
const SCALE = 20;
const SPEED = 180;
const DIRECTIONS = {
  38: { x: 0, y: -1 }, //up
  40: { x: 0, y: 1 }, //down
  37: { x: -1, y: 0 }, //left
  39: { x: 1, y: 0 } //right
};

export {
  CANVAS,
  SNAKE_START,
  APPLE_START,
  SCALE,
  SPEED,
  DIRECTIONS
};