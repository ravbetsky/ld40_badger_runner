import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.spritesheet('badger', 'assets/images/badger_76x32.png', 76, 32, 4)
    this.load.spritesheet('jerboa', 'assets/images/jebroa_58x34.png', 58, 34, 2)
    this.load.spritesheet('cobra', 'assets/images/cobra_48x64.png', 48, 64, 3)
    this.load.image('ground', 'assets/images/ground.png')
    this.load.image('sky', 'assets/images/sky.png')
    this.load.image('wall', 'assets/images/wall.png')
    this.load.image('hive', 'assets/images/hive.png')

  }

  create () {
    this.state.start('Game')
  }
}
