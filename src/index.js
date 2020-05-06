import Phaser from "phaser";
import * as dat from 'dat.gui';



var hint;
var solved = false;

var people = [];


function spawn_person(scene) {
  let person = scene.add.sprite(
    Math.floor(Math.random() * scene.cameras.main.width),
    Math.floor(Math.random() * scene.cameras.main.height),
    'person.walking').play('walking').setInteractive();

  var direction = Math.floor(Math.random() * 361);
  person.setData('direction', direction);
  person.angle = direction;
  person.depth = 0;

  var color = Math.random() * 0xffffff;
  person.setData('color', color);
  person.setTint(color);

  var birthday = new Date(
    Math.floor(Math.random() * 69) + 1950,
    Math.floor(Math.random() * 12) + 1,
    Math.floor(Math.random() * 31) + 1
  );
  person.setData('birthday', birthday);

  people.push(person);

  return person;
}

function despawn_person(index) {
  if (index > people.length) console.error("out of range index given");
  people[index].destroy();
  people.splice(index, 1);
}



const gui = new dat.GUI();

window.walking = true;
gui.add(window, "walking").listen();

window.walking_speed = 0.1;
gui.add(window, "walking_speed", 0.01, 1.0, 0.01);

window.amount_of_people = 32;
gui.add(window, "amount_of_people", 2, 1000, 1).onChange(function (amount) {
  while (amount != people.length) {
    if (amount > people.length) {
      spawn_person(scene);
    } else {
      despawn_person(people.length - 1);
    }
  }
});

window.solve_paradox = function () {
  solved = true;
  walking = false;
  var birthdays = {};
  people.forEach(function (person, index) {
    var birthday = person.getData("birthday");
    if (typeof (birthdays[birthday]) == 'undefined') {
      birthdays[birthday] = person;
      person.setTint(0x808080);
      return;
    } else if (typeof (birthdays[birthday]) == 'object') {
      let color = Math.random() * 0xffffff;
      birthdays[birthday].depth = 2;
      birthdays[birthday].setTint(color);
      birthdays[birthday] = [2, color];
    } else birthdays[birthday][0] += 1;
    person.setTint(birthdays[birthday][1]);
    person.depth = 2;
  });

  var birthdays_repeated = {
    other: 0
  }
  this.Object.keys(birthdays).forEach(function (birthday, index) {
    if (birthdays[birthday] > 1) birthdays_repeated[birthday] = birthdays[birthday];
    else birthdays_repeated["other"] += 1;
  });


}
gui.add(window, "solve_paradox");

window.refresh_population = function () {
  solved = false;
  while (people.length > 0) despawn_person(people.length - 1);
  while (people.length < amount_of_people) spawn_person(scene);
}
gui.add(window, "refresh_population");



var scene;
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
    frameWidth: 32,
    frameHeight: 32,
    endFrame: 0
  });
}


function create() {
  scene = this;

  this.anims.create({
    key: 'walking',
    frames: 'person.walking',
    frameRate: 20,
    repeat: -1
  });

  hint = this.add.text(32, 32, 'Click on someone!', {
    font: '16px Courier',
    fill: '#00ff00'
  });
  hint.depth = 2;


  for (let amount = 0; amount < amount_of_people; amount++) {
    spawn_person(this);
  }


  this.input.on('gameobjectmove', function (pointer, person) {
    hint.setText(person.getData('birthday').toLocaleDateString(
      undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    ));

    if (!solved) person.setTint(0xa3f3ff);
  });

  this.input.on('gameobjectout', function (pointer, person) {
    hint.setText("");

    if (!solved) person.setTint(person.getData('color'));
  });
}


function update(time, delta) {
  if (walking) {
    people.forEach(function (person, index) {
      person.x += Math.cos(person.getData('direction') * Math.PI / 180) * window.walking_speed * delta;
      person.y += Math.sin(person.getData('direction') * Math.PI / 180) * window.walking_speed * delta;
    });

    Phaser.Actions.WrapInRectangle(people, Phaser.Geom.Rectangle.Clone(this.cameras.main), 45);
  }
}