import Phaser from 'phaser'

export default class extends Phaser.State {
  create () {
    let style = {
      fill: '#000',
      fontSize: '32px'
    }
    let text = this.game.add.text(370, 200, `Your Score: ${this.game.score}`, style)
    let textTapToRestart = this.game.add.text(190, 260, `Press any key to restart`, style)
    textTapToRestart.fixedToCamera = true;
    text.fixedToCamera = true;
    text.anchor.setTo(0.5, 0.5)
    this.game.input.keyboard.onDownCallback = (e) => {
      this.state.start('Game')
      this.game.input.keyboard.onDownCallback = false
    }
  }
}
