import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  create () {
    let style = {
      fill: '#000',
      fontSize: '32px'
    }
    let text = this.game.add.text(0, 0, `Your Score: 123`, style)
    this.game.input.keyboard.onDownCallback = (e) => {
      this.state.start('Game')
      this.game.input.keyboard.onDownCallback = false
    }
  }
}
