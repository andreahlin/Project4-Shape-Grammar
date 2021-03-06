
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Lsystem, {LinkedListToString} from './lsystem.js'
import Turtle from './turtle.js'

var turtle;
var geomArr = [];
var branchAngle = 8.0;
var branching = 1;

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // load basic house
  var objLoader = new THREE.OBJLoader();
  objLoader.load('geo/house.obj', function(obj) {
    var cubeGeo = obj.children[0].geometry;
    var cubeMat = new THREE.MeshLambertMaterial( {color: 0xaf1212} );
    var cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    geomArr.push(cubeGeo);
  });

  // load modern house
  objLoader.load('geo/anglehouse.obj', function(obj) {
    var cubeGeo = obj.children[0].geometry;
    var cubeMat = new THREE.MeshLambertMaterial( {color: 0xaf1212} );
    var cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    // scene.add(cubeMesh); 
    geomArr.push(cubeGeo);
  });

// load a door.
  objLoader.load('geo/door.obj', function(obj) {
    var cubeGeo = obj.children[0].geometry;
    var cubeMat = new THREE.MeshLambertMaterial( {color: 0xaf1212} );
    var cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.position.set(0,0,-.07);
    // scene.add(cubeMesh); 
    geomArr.push(cubeGeo);
  });

  // load a chimney
  objLoader.load('geo/cube.obj', function(obj) {
    var cubeGeo = obj.children[0].geometry;
    var cubeMat = new THREE.MeshLambertMaterial( {color: 0xaf1212} );
    var cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.scale.set(0.125,0.40,0.25);
    cubeMesh.position.set(0.65,0.8,0);
    // scene.add(cubeMesh); pls build frkn cities
    geomArr.push(cubeGeo);
  });

  // noise function 
  function noise(x, y) {
    x = (x << 13) ^ x;
    // return x;
    var ret = (1.0 - (x * (y * y * 15731.0 + 789221.0) + 1376312589.0) & 140737488355327) / 10737741824.0; 
    return ret;
  }

  // place and load trees based on noise 
  objLoader.load('geo/tree.obj', function(obj) {
    var cubeGeo = obj.children[0].geometry;
    var cubeMat = new THREE.MeshLambertMaterial( {color: 0x91b66d} );

    for (var x = -17; x < 20; x += 3) {
      for (var z = -20; z < 0; z += 3) {
        var noX = noise(x, z);
        var cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
        cubeMesh.position.set(x + noX * 5, -0.75, z - noX * 5);
        cubeMesh.scale.set(0.7, 0.7, 0.7);
        cubeMesh.rotation.set(0,noX * 10,0);
        scene.add(cubeMesh);
      }
    }

    for (var x = -20; x < -10; x += 3) {
      for (var z = 0; z < 20; z += 3) {
        var noX = noise(x, z);
        var cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
        cubeMesh.rotation.set(0,noX * 10,0);
        cubeMesh.position.set(x + noX * 5, -0.75, z - noX * 5);
        cubeMesh.scale.set(0.7, 0.7, 0.7);
        scene.add(cubeMesh);
      }
    }

  });

  // set background color
  renderer.setClearColor (0xf2caba, 1);

  // initialize simple lighting
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 2, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);
  // add in an ambient light 
  var light = new THREE.AmbientLight( 0x404040, 2);
  scene.add(light);

  // set camera position
  camera.position.set(1, -.5, 10);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // add in ground plane
  // var material = new THREE.MeshLambertMaterial( { color: 0xacaaa5 , side: THREE.DoubleSide} );
  // var geometry = new THREE.PlaneGeometry( 50, 50, 30 );
  // var plane = new THREE.Mesh( geometry, material );
  // plane.rotateX(-Math.PI/2);
  // plane.position.set(0,-1.1,0);
  // scene.add(plane);

  var material = new THREE.MeshLambertMaterial( { color: 0xcbccb8, side: THREE.DoubleSide } );
  var geometry = new THREE.CircleGeometry( 30, 30 );
  var cylinder = new THREE.Mesh( geometry, material );
  cylinder.rotateX(-Math.PI/2);
  cylinder.position.set(0,-1.1, 0);
  scene.add( cylinder );

  // add in "pool"
  var poolGeom = new THREE.CircleGeometry( 5, 32 );
  var mat = new THREE.MeshBasicMaterial( { color: 0xabdbde, side: THREE.DoubleSide} );
  var circle = new THREE.Mesh( poolGeom, mat );
  circle.position.set(0,-1.0,10.0);

  circle.rotateX(-Math.PI/2);
  scene.add( circle );

  // GUI stuff
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  var guiItems = function() {
    this.draw = function() {
        var lsys = new Lsystem(scene, geomArr);
        // only one iteration possible
        doLsystem(lsys, 1 , turtle , scene); 
    };
  }
  var guio = new guiItems(); 

  gui.add(guio, 'draw');
}

// clears the scene by removing all geometries added by turtle.js
function clearScene(turtle) {
  var obj;
  for( var i = turtle.scene.children.length - 1; i > 3; i--) {
      obj = turtle.scene.children[i];
      turtle.scene.remove(obj);
  } 
}

// completes the lsystem
function doLsystem(lsystem, iterations, turtle, scene) {
  lsystem.doIterations(iterations);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
