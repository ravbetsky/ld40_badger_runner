import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)
    this.stamina = 100;
    this.toxication = 0;
    this.xChange = 0;
  }
  update() {
    this.xChange += this.deltaX
  }
}
