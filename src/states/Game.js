/* globals __DEV__ */
import Phaser from 'phaser'
import Badger from '../sprites/Badger'
import { ProceduralManager } from '../utils'

const RUN_VELOCITY_X = 550;
const JUMP_VELOCITY_X = 450;
const JUMP_VELOCITY_Y = -450;
const STAMINA_PER_SECOND_DECREASE = 10;
const COBRA_UP_STAMINA = 50;
const COBRA_UP_TOXICITY = 25;
const JEBROA_UP_STAMINA = 15;
const HIVE_DOWN_TOXICITY = 50;
const WALLS_RANGE = 60;
const JERBOAS_RANGE = 50;
const HIVES_RANGE = 30;
const COBRAS_RANGE = 50;

export default class extends Phaser.State {
  init() {}
  preload() {}

  create() {
    this.game.score = 0
    this.game.antialias = false
    this.game.physics.startSystem(Phaser.Physics.ARCADE)

    this.procData = new ProceduralManager('walls', 'jerboas', 'hives', 'cobras')

    this.procData.setSecureRange('walls', 170)
    this.procData.setIntervalToCreate('walls', 2, 3)

    this.procData.setSecureRange('jerboas', 100)
    this.procData.setIntervalToCreate('jerboas', 1, 3)

    this.procData.setSecureRange('hives', 50)
    this.procData.setIntervalToCreate('hives', 7, 10)

    this.procData.setSecureRange('cobras', 150)
    this.procData.setIntervalToCreate('cobras', 2, 6)

    let sky = this.game.add.sprite(0, 0, 'sky');
    sky.fixedToCamera = true;

    this.platforms = game.add.group();
    this.platforms.enableBody = true;

    this.walls = game.add.group();
    this.walls.enableBody = true;

    this.food = game.add.group();
    this.food.enableBody = true;

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
    this.scoreText = game.add.text(this.game.width - 170, 16, `Score: ${this.game.score}`, { fontSize: '32px', fill: '#000' }, this.ui);

    this.game.camera.follow(this.badger);
    this.game.add.existing(this.badger);
    this.game.physics.enable(this.badger, Phaser.Physics.ARCADE);
    this.badger.body.gravity.y = 960;

    game.time.events.loop(Phaser.Timer.SECOND, this.calculateStaminaAndScore.bind(this), this);

    this.createNewSection()
  }

  callGameOver() {
    this.state.start('GameOver')
  }

  calculateStaminaAndScore() {
    this.badger.stamina -= 10;
    this.game.score += 1
    this.badger.stamina = this.badger.stamina < 0 ? 0 : this.badger.stamina
    if(this.badger.stamina === 0) {
      this.callGameOver()
    }
    this.scoreText.setText(`Score: ${this.game.score}`);
    this.staminaText.setText(`Stamina: ${this.badger.stamina}`);
  }

  isCorrectNewPositionX(positionX, ground) {
    let result = true;
    for (let key in ground.proceduralObjects) {
      if(ground.proceduralObjects[key].length > 0) {
        const x = ground.proceduralObjects[key][0]
        const range = this.procData.manager[key].secureRange
        if(Math.abs(x - positionX) < range) {
          result = false;
        }
      }
    }
    return result
  }

  getProceduralPoisionX(minX, maxX, ground) {
    let random = game.rnd.between(minX, maxX)
    let limit = 500
    while(limit--) {
      if(this.isCorrectNewPositionX(random, ground)) {
        break
      } else {
        random = game.rnd.between(minX, maxX)
      }
    }
    return random
  }

  generateProcedural(newGroundRange, ground) {
    this.createWall(this.getProceduralPoisionX(...newGroundRange, ground), ground)
    this.createCobra(this.getProceduralPoisionX(...newGroundRange, ground), ground)
    this.createJerboa(this.getProceduralPoisionX(...newGroundRange, ground), ground)
    this.createHive(this.getProceduralPoisionX(...newGroundRange, ground), ground)
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
      const newGroundRange = [positionX + 50, positionX + ground.width - 50]
      this.generateProcedural(newGroundRange, ground)
    }
  }

  createWall(positionX, ground) {
    const lastSectionIndex = this.platforms.children.length - 1;
    if(this.procData.isAllowedToCreate('walls', lastSectionIndex)) {
      let wall = this.walls.create(positionX, ground.position.y - 55, 'wall');
      ground.proceduralObjects.walls.push(positionX)
      wall.body.setSize(wall.body.width, wall.body.height, 0, 25)
      wall.body.immovable = true;
      this.procData.setLatestSection('walls', lastSectionIndex)
    }
  }

  createCobra(positionX, ground) {
    const lastSectionIndex = this.platforms.children.length - 1;
    if(this.procData.isAllowedToCreate('cobras', lastSectionIndex)) {
      const lastSectionIndex = this.platforms.children.length - 1;
      let cobra = this.food.create(positionX, ground.position.y - 55, 'cobra');
      ground.proceduralObjects.cobras.push(positionX)
      cobra.body.immovable = true;
      this.procData.setLatestSection('cobras', lastSectionIndex)
    }
  }

  createJerboa(positionX, ground) {
    const lastSectionIndex = this.platforms.children.length - 1;
    if(this.procData.isAllowedToCreate('jerboas', lastSectionIndex)) {
      let jerboa = this.food.create(positionX, ground.position.y - 15, 'jerboa');
      ground.proceduralObjects.jerboas.push(positionX)
      jerboa.body.immovable = true;
      this.procData.setLatestSection('jerboas', lastSectionIndex)
    }
  }

  createHive(positionX, ground) {
    const lastSectionIndex = this.platforms.children.length - 1;
    if(this.procData.isAllowedToCreate('hives', lastSectionIndex)) {
      let hive = this.food.create(positionX, ground.position.y - 125, 'hive');
      ground.proceduralObjects.hives.push(positionX)
      hive.body.immovable = true;
      this.procData.setLatestSection('hives', lastSectionIndex)
    }
  }

  handleHitWall(badger, wall) {
    this.callGameOver()
  }

  eatSomeFood(badger, food) {
    if(food.key === 'cobra') {
      badger.stamina += COBRA_UP_STAMINA;
      badger.toxication += COBRA_UP_TOXICITY;
    }
    if(food.key === 'jebroa') {
      badger.stamina += JEBROA_UP_STAMINA;
    }
    if(food.key === 'hive') {
      badger.toxication -= HIVE_DOWN_TOXICITY;
    }
    food.kill()
    badger.stamina = badger.stamina > 100 ? 100 : badger.stamina
    badger.toxication = badger.toxication < 0 ? 0 : badger.toxication
    if(badger.toxication >= 100) {
      this.callGameOver()
    }
    this.staminaText.setText(`Stamina: ${badger.stamina}`)
    this.toxicationText.setText(`Toxication: ${badger.toxication}`)
  }

  update() {
    const cursors = game.input.keyboard.createCursorKeys();
    const hitPlatform = game.physics.arcade.collide(this.badger, this.platforms);

    // Badger is always hungry
    game.physics.arcade.overlap(this.badger, this.food, this.eatSomeFood, null, this);

    // Badger don't like walls
    game.physics.arcade.overlap(this.badger, this.walls, this.handleHitWall, null, this);

    // Infinite world
    this.world.setBounds(this.badger.xChange, 0, this.game.width + this.badger.xChange, this.game.height);

    // Run badger run
    if(hitPlatform) {
      if(this.badger.body.velocity.x !== RUN_VELOCITY_X) {
        this.add.tween(this.badger.body.velocity).to({ x: RUN_VELOCITY_X }, 300, Phaser.Easing.Linear.None, true)
      } else {
        this.badger.body.velocity.x = RUN_VELOCITY_X;
      }
    }

    // Jump or accelerate
    if (cursors.up.isDown && this.badger.body.touching.down && hitPlatform) {
      this.badger.body.velocity.y = JUMP_VELOCITY_Y;
      this.add.tween(this.badger.body.velocity).to({ x: JUMP_VELOCITY_X }, 300, Phaser.Easing.Linear.None, true);
    }

    const lastSection = this.platforms.children[this.platforms.children.length - 1]
    const extraLastSectionX = (lastSection.position.x + lastSection.width) - this.world.width

    // Run procedural new section
    if(extraLastSectionX === 0 || extraLastSectionX <= 100) {
      this.createNewSection(lastSection)
    }
  }

  render() {
    // if (__DEV__) {
    //   this.game.debug.spriteInfo(this.mushroom, 32, 32)
    // }
  }
}
