import Phaser from "phaser";
import logoImg from "./assets/icon.svg";

const config = {
  type: Phaser.AUTO,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  scale: {
      mode: Phaser.Scale.RESIZE
  }
};

const game = new Phaser.Game(config);


var people = [];

function preload() {
  this.load.spritesheet('person.walking', 'src/assets/person.walking.png', { frameWidth: 37, frameHeight: 45, endFrame: 17 });
}

function create() {
  this.anims.create({
    key: 'run',
    frames: 'person.walking',
    frameRate: 20,
    repeat: -1
  });

  for (let p = 0; p < 25; p++)
  {
    let person = this.add.sprite(
      Math.floor(Math.random() * this.cameras.main.width),
      Math.floor(Math.random() * this.cameras.main.height),
      'person.walking').play('run').setInteractive();
    
    person.setData('direction', Math.random());

    people.push(person);
  }
}

function update(time, delta) {
  people.forEach(function (person, index) {
    person.x += Math.cos(person.getData('direction')) * 0.1 * delta;
    person.y += Math.sin(person.getData('direction')) * 0.1 * delta;
  });

  Phaser.Actions.WrapInRectangle(people, Phaser.Geom.Rectangle.Clone(this.cameras.main), 45);
}
