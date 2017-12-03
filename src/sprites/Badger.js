import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  constructor ({ game, x, y, asset, frame }) {
    super(game, x, y, asset, frame)
    this.stamina = 100;
    this.toxication = 0;
    this.xChange = 0;
    this.animations.add("run", [0, 1, 2], 10, true)
  }
  update() {
    this.xChange += this.deltaX
  }
}
