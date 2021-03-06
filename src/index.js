import Phaser from "phaser";
import * as dat from "dat.gui";
import {
  Chart
} from "chart.js";



var hint;
var solved = false;

var chart;
var probability;

var people = [];


function spawn_person(scene) {
  let person = scene.add.sprite(
    Math.floor(Math.random() * scene.cameras.main.width),
    Math.floor(Math.random() * scene.cameras.main.height),
    "person.walking").play("walking").setInteractive();

  var direction = Math.floor(Math.random() * 361);
  person.setData("direction", direction);
  person.angle = direction;
  person.depth = 0;

  var color = Math.floor(Math.random() * 0xffffff);
  person.setData("color", color);
  person.setTint(color);

  var birthday = new Date(
    Math.floor(Math.random() * 69) + 1950,
    Math.floor(Math.random() * 12) + 1,
    Math.floor(Math.random() * 31) + 1
  );
  person.setData("birthday", birthday);

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
  solved = false;
  if (typeof (chart) == 'object') chart.destroy();
  if (typeof (probability) == 'object') probability.destroy();
  people.forEach((person, index) => person.setTint(person.getData("color")));
  while (amount != people.length) {
    if (amount > people.length) {
      spawn_person(scene);
    } else {
      despawn_person(people.length - 1);
    }
  }
});

window.solve_paradox = function () {
  if (solved) return;
  solved = true;
  walking = false;
  var birthdays = {};
  people.forEach(function (person, index) {
    var birthday = person.getData("birthday").toLocaleDateString(
      undefined, {
        month: "long",
        day: "numeric"
      }
    );

    if (typeof (birthdays[birthday]) == "undefined") {
      birthdays[birthday] = person;
      person.setTint(0x808080);
      return;
    } else if (Array.isArray((birthdays[birthday])))
      birthdays[birthday][0] += 1;
    else {
      let color = Math.floor(Math.random() * 0xffffff);
      birthdays[birthday].depth = 2;
      birthdays[birthday].setTint(color);
      birthdays[birthday] = [2, color];
    }
    person.setTint(birthdays[birthday][1]);
    person.depth = 2;
  });


  let labels = ["Other"]
  let colors = ["#808080"]
  let data = [0]
  this.Object.keys(birthdays).forEach(function (birthday, index) {
    if (Array.isArray(birthdays[birthday])) {
      labels.push(birthday);
      colors.push("#" + Math.floor(birthdays[birthday][1]).toString(16));
      data.push(birthdays[birthday][0]);
    } else data[0] += 1;
  });


  if (typeof (chart) == 'object') chart.destroy();
  chart = new Chart(document.getElementById("chart-canvas"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "# people",
        data: data,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });

  if (typeof (probability) == 'object') probability.destroy();

  var C;
  var N = people.length;
  var probabilities = [];
  for (C = 2.0; C <= 10; C++) {
    var Binom = 0.0;
    for (var i = 0.0; i < C; i++) {
      Binom += Math.log10(N - i);
      Binom -= Math.log10(i + 1);
    }
    var result = Math.pow(10, Binom);
    result = 1 - Math.exp(-(result) / (Math.pow(365, C - 1)));
    if (result > 0.000001)
      probabilities.push(result);
  }

  labels = [];
  probabilities.forEach(function (value, index) {
    labels.push(index + 1);
  });


  probability = new Chart(document.getElementById("probability-canvas"), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Birthday Clash %',
        backgroundColor: 'rgb(255, 192, 203)',
        borderColor: 'rgb(255, 192, 203)',
        pointBackgroundColor: 'rgb255, 192, 203)',
        pointBorderColor: 'rgb(255, 192, 203)',
        data: probabilities,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Clashes'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Probability'
          }
        }]
      }
    }
  });
}
gui.add(window, "solve_paradox");

window.refresh_population = function () {
  solved = false;
  if (typeof (chart) == 'object') chart.destroy();
  if (typeof (probability) == 'object') probability.destroy();
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
  this.load.spritesheet("person.walking", "https://raw.githubusercontent.com/ClarkThyLord/Birthday-Clash/master/src/assets/person.walking.png", {
    frameWidth: 32,
    frameHeight: 32,
    endFrame: 0
  });
}


function create() {
  scene = this;
  game.canvas.id = "main-canvas";

  this.anims.create({
    key: "walking",
    frames: "person.walking",
    frameRate: 20,
    repeat: -1
  });

  hint = this.add.text(32, 32, "Click on someone!", {
    font: "16px Courier",
    fill: "#00ff00"
  });
  hint.depth = 2;


  for (let amount = 0; amount < amount_of_people; amount++) {
    spawn_person(this);
  }


  this.input.on("gameobjectmove", function (pointer, person) {
    hint.setText(person.getData("birthday").toLocaleDateString(
      undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    ));

    if (!solved) person.setTint(0xa3f3ff);
  });

  this.input.on("gameobjectout", function (pointer, person) {
    hint.setText("");

    if (!solved) person.setTint(person.getData("color"));
  });
}


function update(time, delta) {
  if (walking) {
    people.forEach(function (person, index) {
      person.x += Math.cos(person.getData("direction") * Math.PI / 180) * window.walking_speed * delta;
      person.y += Math.sin(person.getData("direction") * Math.PI / 180) * window.walking_speed * delta;
    });

    Phaser.Actions.WrapInRectangle(people, Phaser.Geom.Rectangle.Clone(this.cameras.main), 45);
  }
}