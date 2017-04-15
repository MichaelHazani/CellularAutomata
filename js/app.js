var camera, scene, renderer, camContainer;
var effect, controls;
var controller1, controller2;
var controls;
var cube;
var globalPlane, localPlane;
var raycaster, intersected = [];
var tempMatrix = new THREE.Matrix4();
var group;

init();

animate();


function init() {
  //marble floor
  var loader = new THREE.TextureLoader();
  loader.setPath('./resources/MarbleMat/');
  var marbleMatGroup = [];
  var marAO = loader.load('Ambient_Occlusion.png');
  var marBase = loader.load('Base_Color.png');
  var marDisplacement = loader.load('Displacement.png');
  var marNormal = loader.load('Normal.png');
  var marRoughness = loader.load('Roughness.png');
  marbleMatGroup.push(marAO, marBase, marDisplacement, marNormal, marRoughness);

  for (var i = 0; i < marbleMatGroup.length; i++) {
    marbleMatGroup[i].repeat.set( 14, 14 );
    marbleMatGroup[i].wrapS = marbleMatGroup[i].wrapT = THREE.RepeatWrapping;
    marbleMatGroup[i].magFilter = THREE.NearestFilter;
    marbleMatGroup[i].format = THREE.RGBFormat;
  }



    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
    scene.add(camera);

    raycaster = new THREE.Raycaster();
    group = new THREE.Group();
		scene.add( group );


    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    // renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById("container").appendChild(renderer.domElement);

    if (WEBVR.isAvailable() === false) {
        document.body.appendChild(WEBVR.getMessage());
    }
    controls = new THREE.VRControls(camera);
    controls.standing = true;

    controller1 = new THREE.ViveController(0);
    controller1.standingMatrix = controls.getStandingMatrix();
    controller2 = new THREE.ViveController(1);
    controller2.standingMatrix = controls.getStandingMatrix();

    controller1.addEventListener( 'triggerdown', onTriggerDown );
    controller1.addEventListener( 'triggerup', onTriggerUp );
    controller2.addEventListener( 'triggerdown', onTriggerDown );
    controller2.addEventListener( 'triggerup', onTriggerUp );
    // camContainer.add(controller1);
    // camContainer.add(controller2);
		scene.add(controller1);
		scene.add(controller2);
    effect = new THREE.VREffect(renderer);
    if (WEBVR.isAvailable() === true) {
        document.body.appendChild(WEBVR.getButton(effect));
    }

    var loader = new THREE.OBJLoader();
    loader.setPath('./resources/vive/');
    loader.load('vr_controller_vive_1_5.obj', function(object) {
        var loader = new THREE.TextureLoader();
        loader.setPath('resources/vive/');
        var controller = object.children[0];
        controller.material.map = loader.load('onepointfive_texture.png');
        controller.material.specularMap = loader.load('onepointfive_spec.png');
        controller1.add(object.clone());
        controller2.add(object.clone());

    });
    var geometry = new THREE.Geometry();
geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
geometry.vertices.push( new THREE.Vector3( 0, 0, - 1 ) );

  var line = new THREE.Line( geometry );
    line.name = 'line';
    line.scale.z = 5;
    controller1.add( line.clone() );
    controller2.add( line.clone() );

    //floor

				var geometry = new THREE.PlaneGeometry( 34, 34 );
				var material = new THREE.MeshStandardMaterial( {
					color: 0x222222,
					roughness: 1.0,
					metalness: 0.0
				} );
        var marbleMat = new THREE.MeshStandardMaterial({
        aoMap: marAO,
        displacementMap: marDisplacement,
        map: marBase,
        normalMap: marNormal,
        roughnessMap: marRoughness
        });

				var floor = new THREE.Mesh( geometry, marbleMat );

				floor.rotation.x = - Math.PI / 2;
				floor.receiveShadow = true;
        floor.position.set(0,-1,0);
        scene.add( floor );


    //light
    var light = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(light);
    light.position.y = 30;
    var ambi = new THREE.AmbientLight(0xffffff);
    scene.add(ambi);

    //skybox
    var geometry = new THREE.SphereGeometry(1000, 60, 40);
geometry.scale(-1, 1, 1);

var material = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('./resources/skies/sky_vue2.jpg')
});

var skybox = new THREE.Mesh(geometry, material);
skybox.position.set(0, 30, 0);
scene.add(skybox);

//clipping planes

    localPlane = new THREE.Plane(new THREE.Vector3(-.5,0,0), .5); // change dist to less

    // var visiblePlane = new THREE.PlaneBufferGeometry(15,20,32);

    // var planeMat = new THREE.MeshBasicMaterial({color: 0xffff00, side:THREE.DoubleSide});
    // var plane = new THREE.Mesh(visiblePlane, planeMat);
// plane.rotation.x =  Math.PI / 2;
// plane.position.z = 30;

    // scene.add(plane);
// console.log(localPlane.normal);
    // renderer.clippingPlanes = [ localPlane ];

    renderer.localClippingEnabled = true;

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshPhongMaterial({
        color: 0x2194CE,
        shininess: 100,
        side: THREE.DoubleSide,
        clippingPlanes: [localPlane],
        clipShadows: true
    });
    cube = new THREE.Mesh(geometry, material);
cube.position.z = 5;
cube.position.y = 2;
cube.name = "rotatebox";
    group.add(cube);

    //
    // document.onkeydown = function(key) {
    //   console.log(key);
    //   console.log(localPlane.normal);
    // }

}

function render() {
    var timer = Date.now() * 0.0001;

    controller1.update();
    controller2.update();
    controls.update();
    effect.render(scene, camera);
    // localPlane.normal.x = controller1.rotation.x;
    // localPlane.normal.y = controller1.rotation.y;
    // localPlane.normal.z = controller1.rotation.z;
    cube.rotation.x = Math.cos(timer) * 5;
    cube.rotation.z = Math.sin(timer) * 5;
// localPlane.normal.y = Math.cos(timer) * 5;
    // console.log(camera.position);

}

function animate() {
    effect.requestAnimationFrame(animate);

    render();
}


//raycasting/interaction
function onTriggerDown( event ) {
  // console.log(event.target);
  var controller = event.target;
  var intersections = getIntersections( controller );
  if ( intersections.length > 0 ) {
    var intersection = intersections[ 0 ];
    tempMatrix.getInverse( controller.matrixWorld );
    var object = intersection.object;
    object.matrix.premultiply( tempMatrix );
    object.matrix.decompose( object.position, object.quaternion, object.scale );
    // object.material.emissive.b = 1;
    controller.add( object );
    controller.userData.selected = object;
  }
}
function onTriggerUp( event ) {
  var controller = event.target;
  if ( controller.userData.selected !== undefined ) {
    var object = controller.userData.selected;
    object.matrix.premultiply( controller.matrixWorld );
    object.matrix.decompose( object.position, object.quaternion, object.scale );
    // object.material.emissive.b = 0;
    group.add( object );

    controller.userData.selected = undefined;
    console.log(object.position, object.scale);
  }
}
function getIntersections( controller ) {
  tempMatrix.identity().extractRotation( controller.matrixWorld );
  raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
  raycaster.ray.direction.set( 0, 0, -1 ).applyMatrix4( tempMatrix );
  return raycaster.intersectObjects( group.children );
}
function intersectObjects( controller ) {
  // Do not highlight when already selected
  if ( controller.userData.selected !== undefined ) return;
  var line = controller.getObjectByName( 'line' );
  var intersections = getIntersections( controller );
  if ( intersections.length > 0 ) {
    var intersection = intersections[ 0 ];
    var object = intersection.object;
    // object.material.emissive.r = 1;
    intersected.push( object );
    line.scale.z = intersection.distance;
  } else {
    line.scale.z = 5;
  }
}
function cleanIntersected() {
  while ( intersected.length ) {
    var object = intersected.pop();

  }
}


window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    effect.setSize(window.innerWidth, window.innerHeight);
}
