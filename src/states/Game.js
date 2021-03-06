/* globals __DEV__ */
import Phaser from 'phaser'
import Badger from '../sprites/Badger'
import { ProceduralManager } from '../utils'

const RUN_VELOCITY_X = 500;
const JUMP_VELOCITY_X = 370;
const JUMP_VELOCITY_Y = -450;
const STAMINA_PER_SECOND_DECREASE = 15;
const COBRA_UP_STAMINA = 25;
const COBRA_UP_TOXICITY = 25;
const JEBROA_UP_STAMINA = 10;
const HIVE_DOWN_TOXICITY = 50;
const WALLS_RANGE = 150;
const JERBOAS_RANGE = 70;
const HIVES_RANGE = 70;
const COBRAS_RANGE = 70;
const WALLS_CREATE_INTERVAL = [1, 1];
const JERBOAS_CREATE_INTERVAL = [1, 1];
const HIVES_CREATE_INTERVAL = [4, 7];
const COBRAS_CREATE_INTERVAL = [1, 3];
const OBJECTS_RANGE_OFFSET = 150;

if(WALLS_RANGE * 2 + JERBOAS_RANGE * 2 + HIVES_RANGE * 2 + COBRAS_RANGE * 2 > 760) {
  throw WALLS_RANGE * 2 + JERBOAS_RANGE * 2 + HIVES_RANGE * 2 + COBRAS_RANGE * 2 + ' impossible params'
}

export default class extends Phaser.State {
  init() {}

  create() {
    this.localStorage = localStorage;
    this.game.score = 0
    this.game.antialias = false
    this.game.physics.startSystem(Phaser.Physics.ARCADE)

    this.procData = new ProceduralManager('walls', 'jerboas', 'hives', 'cobras')

    this.procData.setSecureRange('walls', WALLS_RANGE)
    this.procData.setIntervalToCreate('walls', ...WALLS_CREATE_INTERVAL)

    this.procData.setSecureRange('jerboas', JERBOAS_RANGE)
    this.procData.setIntervalToCreate('jerboas', ...JERBOAS_CREATE_INTERVAL)

    this.procData.setSecureRange('hives', HIVES_RANGE)
    this.procData.setIntervalToCreate('hives', ...HIVES_CREATE_INTERVAL)

    this.procData.setSecureRange('cobras', COBRAS_RANGE)
    this.procData.setIntervalToCreate('cobras', ...COBRAS_CREATE_INTERVAL)

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
      asset: 'badger',
      frame: 0
    })

    this.ui = game.add.group();
    this.ui.fixedToCamera = true;

    let bgForStamina = this.ui.create(26, 24, 'bar')
    this.staminaBar = this.game.make.graphics(32, 32)
    this.staminaBar.beginFill(0xff0000, 0.7);
    this.staminaBar.drawRect(0, 0, 200, 30);
    this.ui.add(this.staminaBar)

    let bgForToxication = this.ui.create(26, 70, 'bar')
    this.toxicationBar = this.game.make.graphics(32, 78)
    this.toxicationBar.beginFill(0x00ff2f, 0.7);
    this.toxicationBar.drawRect(0, 0, 200, 30);
    this.toxicationBar.width = 0
    this.ui.add(this.toxicationBar)

    this.scoreText = game.add.text(this.game.width - 170, 16, `Score: ${this.game.score}`, { fontSize: '32px', fill: '#fff' }, this.ui);
    this.highscoreText = game.add.text(this.game.width - 200, 52, `High score: ${this.localStorage.getItem("highscore") === null ? 0 : this.localStorage.getItem("highscore")}`, { fontSize: '24px', fill: '#fff' }, this.ui);

    this.game.camera.follow(this.badger);
    this.game.add.existing(this.badger);
    this.game.physics.enable(this.badger, Phaser.Physics.ARCADE);
    this.badger.body.setSize(this.badger.body.width, this.badger.body.height, -20, 0)
    this.badger.body.gravity.y = 960;

    game.time.events.loop(Phaser.Timer.SECOND, this.calculateStaminaAndScore.bind(this), this);

    this.createNewSection()
  }

  updateUI() {
    this.scoreText.setText(`Score: ${this.game.score}`)
    this.toxicationBar.width = this.badger.toxication * 2
    this.staminaBar.width = this.badger.stamina * 2
  }

  callGameOver() {
    if(this.localStorage.getItem("highscore") === null) {
      localStorage.setItem("highscore", this.game.score);
    }
    if (this.game.score > this.localStorage.getItem("highscore")) {
      localStorage.setItem("highscore", this.game.score);
    }
    this.state.restart('Game')
  }

  calculateStaminaAndScore() {
    this.badger.stamina -= 10;
    this.game.score += 1
    this.badger.stamina = this.badger.stamina < 0 ? 0 : this.badger.stamina
    if(this.badger.stamina === 0) {
      this.callGameOver()
    }
    this.updateUI()
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
    let random = game.rnd.integerInRange(minX, maxX)
    let limit = 500 // If something goes wrong with procedural generation leave currently random :)
    while(limit--) {
      if(this.isCorrectNewPositionX(random, ground)) {
        break
      } else {
        random = game.rnd.integerInRange(minX, maxX)
      }
    }
    return random
  }

  generateProcedural(newGroundRange, ground) {
    this.createJerboa(this.getProceduralPoisionX(...newGroundRange, ground), ground)
    this.createHive(this.getProceduralPoisionX(...newGroundRange, ground), ground)
    this.createCobra(this.getProceduralPoisionX(...newGroundRange, ground), ground)
    this.createWall(this.getProceduralPoisionX(...newGroundRange, ground), ground)
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
    if(lastSection !== 0) {
      const newGroundRange = [positionX + OBJECTS_RANGE_OFFSET, positionX + ground.width - OBJECTS_RANGE_OFFSET]
      this.generateProcedural(newGroundRange, ground)
    }
  }

  createWall(positionX, ground) {
    const lastSectionIndex = this.platforms.children.length - 1;
    if(this.procData.isAllowedToCreate('walls', lastSectionIndex)) {
      let wall = this.walls.create(positionX, ground.position.y - 35, 'wall');
      ground.proceduralObjects.walls.push(positionX)
      wall.body.setSize(wall.body.width, wall.body.height, 0, 15)
      wall.body.immovable = true;
      this.procData.setLatestSection('walls', lastSectionIndex)
    }
  }

  createCobra(positionX, ground) {
    const lastSectionIndex = this.platforms.children.length - 1;
    if(this.procData.isAllowedToCreate('cobras', lastSectionIndex)) {
      const lastSectionIndex = this.platforms.children.length - 1;
      let cobra = this.food.create(positionX, ground.position.y - 25, 'cobra');
      cobra.animations.add('stand', [0, 1, 2], 3, true)
      cobra.animations.play('stand')
      ground.proceduralObjects.cobras.push(positionX)
      cobra.body.immovable = true;
      this.procData.setLatestSection('cobras', lastSectionIndex)
    }
  }

  createJerboa(positionX, ground) {
    const lastSectionIndex = this.platforms.children.length - 1;
    if(this.procData.isAllowedToCreate('jerboas', lastSectionIndex)) {
      let jerboa = this.food.create(positionX, ground.position.y, 'jerboa');
      jerboa.animations.add('stand', [0, 1], 3, true)
      jerboa.animations.play('stand')
      ground.proceduralObjects.jerboas.push(positionX)
      jerboa.body.immovable = true;
      this.procData.setLatestSection('jerboas', lastSectionIndex)
    }
  }

  createHive(positionX, ground) {
    const lastSectionIndex = this.platforms.children.length - 1;
    if(this.procData.isAllowedToCreate('hives', lastSectionIndex)) {
      let hive = this.food.create(positionX, ground.position.y - 125, 'hive');
      game.add.tween(hive).to({
        y: hive.position.y + 100
      }, 2000, Phaser.Easing.Sinusoidal.Linear, true, 0, 10, true);
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
    if(food.key === 'jerboa') {
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
    this.updateUI()
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
      this.badger.animations.play('run')
      if(this.badger.body.velocity.x !== RUN_VELOCITY_X) {
        this.add.tween(this.badger.body.velocity).to({ x: RUN_VELOCITY_X }, 300, Phaser.Easing.Linear.None, true)
      } else {
        this.badger.body.velocity.x = RUN_VELOCITY_X;
      }
    } else {
      this.badger.animations.stop('run')
      this.badger.frame = 1
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
  }
}
