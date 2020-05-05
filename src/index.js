import Phaser from "phaser";

var hint;
var selected;

var people = [];


const game = new Phaser.Game({
  type: Phaser.AUTO,
  fps: {
    min: 25,
    target: 30
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  scale: {
    mode: Phaser.Scale.RESIZE
  }
});


function preload() {
  this.load.spritesheet('person.walking', 'src/assets/person.walking.png', {
    frameWidth: 37,
    frameHeight: 45,
    endFrame: 17
  });
}


function create() {
  this.anims.create({
    key: 'run',
    frames: 'person.walking',
    frameRate: 20,
    repeat: -1
  });

  hint = this.add.text(32, 32, 'Click on someone!', {
    font: '16px Courier',
    fill: '#00ff00'
  });

  for (let p = 0; p < 25; p++) {
    let person = this.add.sprite(
      Math.floor(Math.random() * this.cameras.main.width),
      Math.floor(Math.random() * this.cameras.main.height),
      'person.walking').play('run').setInteractive();

    var birthday = new Date(
      Math.floor(Math.random() * 69) + 1950,
      Math.floor(Math.random() * 12) + 1,
      Math.floor(Math.random() * 31) + 1
    );
    person.setData('birthday', birthday);

    var direction = Math.floor(Math.random() * 360);
    person.flipX = direction >= 180
    person.setData('direction', direction);

    people.push(person);
  }

  this.input.on('gameobjectup', function (pointer, person) {
    if (selected) selected.setTint(0xffffff);
    selected = person;

    hint.setText(person.getData('birthday').toLocaleDateString(
      undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    ));
    person.setTint(0x98ff75);
  });
}


function update(time, delta) {
  people.forEach(function (person, index) {
    person.x += Math.cos(person.getData('direction') * Math.PI / 180) * 0.1 * delta;
    person.y += Math.sin(person.getData('direction') * Math.PI / 180) * 0.1 * delta;
  });

  Phaser.Actions.WrapInRectangle(people, Phaser.Geom.Rectangle.Clone(this.cameras.main), 45);
}