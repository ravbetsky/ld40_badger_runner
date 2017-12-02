/* globals __DEV__ */
import Phaser from 'phaser'
import Badger from '../sprites/Badger'

export default class extends Phaser.State {
  init() {}
  preload() {}

  create() {
    this.game.antialias = false
    this.game.physics.startSystem(Phaser.Physics.ARCADE)

    let sky = this.game.add.sprite(0, 0, 'sky');
    sky.fixedToCamera = true;

    this.platforms = game.add.group();
    this.platforms.enableBody = true;

    this.walls = game.add.group();
    this.walls.enableBody = true;

    this.badger = new Badger({
      game: this.game,
      x: this.world.left + 100,
      y: game.world.height - 100,
      asset: 'badger'
    })

    this.ui = game.add.group();
    this.ui.fixedToCamera = true;

    this.staminaText = game.add.text(16, 16, `Stamina: ${this.badger.stamina}`, { fontSize: '32px', fill: '#000' }, this.ui);
    this.toxicationText = game.add.text(16, 52, `Toxication: ${this.badger.toxication}`, { fontSize: '32px', fill: '#000' }, this.ui);

    this.game.camera.follow(this.badger);
    this.game.add.existing(this.badger);
    this.game.physics.enable(this.badger, Phaser.Physics.ARCADE);
    this.badger.body.gravity.y = 960;

    this.createNewSection()
  }

  createNewSection(lastSection = 0) {
    const positionX = lastSection === 0 ? 0 : lastSection.position.x + lastSection.width
    let ground = this.platforms.create(positionX, game.world.height - 64, 'ground');
    ground.proceduralObjects = {
      walls: [],
      jerboas: [],
      hives: [],
      cobras: []
    }
    ground.scale.setTo(2, 2);
    ground.width = game.width;
    ground.body.immovable = true;
    ground.body.setSize(ground.body.width, ground.body.height, 0, 15)

    // Do not run procedural generation for the first section
    if(lastSection) {
      this.createWall(game.rnd.between(positionX, positionX + ground.width), ground)
    }
  }

  createWall(positionX, ground) {
    let wall = this.walls.create(positionX, ground.position.y - 55, 'wall');
    ground.proceduralObjects.walls.push(positionX)
    wall.body.immovable = true;
  }

  update() {
    const cursors = game.input.keyboard.createCursorKeys();
    const hitPlatform = game.physics.arcade.collide(this.badger, this.platforms);
    const hitWall = game.physics.arcade.collide(this.badger, this.walls);

    // Infinite world
    this.world.setBounds(this.badger.xChange, 0, this.game.width + this.badger.xChange, this.game.height);

    // Run badger run
    this.badger.body.velocity.x = 350;

    // Jump or accelerate
    if (cursors.up.isDown && this.badger.body.touching.down && hitPlatform) {
      this.badger.body.velocity.y = -450;
    }

    // if (cursors.right.isDown && this.badger.body.touching.down) {
    //   this.badger.body.velocity.x = 320;
    // }

    const lastSection = this.platforms.children[this.platforms.children.length - 1]
    const extraLastSectionX = (lastSection.position.x + lastSection.width) - this.world.width

    // Run procedural new section
    if(extraLastSectionX === 0 || extraLastSectionX <= 200) {
      this.createNewSection(lastSection)
    }
  }

  render() {
    // if (__DEV__) {
    //   this.game.debug.spriteInfo(this.mushroom, 32, 32)
    // }
  }
}
