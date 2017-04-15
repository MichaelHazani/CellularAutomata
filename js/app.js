var player, camera, scene, renderer, camContainer;
var effect, controls;
var controller1, controller2;
var controls;
var cube;
var globalPlane, localPlane;
var raycaster, intersected = [];
var tempMatrix = new THREE.Matrix4();
var group;
var skybox, skyboxLayer2;

init();
animate();


function init() {


    // Marble floor
    var textLoader = new THREE.TextureLoader();
    textLoader.setPath('./resources/MarbleMat/');
    var marbleMatGroup = [];
    var marAO = textLoader.load('Ambient_Occlusion.png');
    var marBase = textLoader.load('Base_Color.png');
    var marDisplacement = textLoader.load('Displacement.png');
    var marNormal = textLoader.load('Normal.png');
    var marRoughness = textLoader.load('Roughness.png');
    marbleMatGroup.push(marAO, marBase, marDisplacement, marNormal, marRoughness);

    for (var i = 0; i < marbleMatGroup.length; i++) {
        marbleMatGroup[i].repeat.set(14, 14);
        marbleMatGroup[i].wrapS = marbleMatGroup[i].wrapT = THREE.RepeatWrapping;
        marbleMatGroup[i].magFilter = THREE.NearestFilter;
        marbleMatGroup[i].format = THREE.RGBFormat;
    }


    // Gate
    //
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('./resources/obj/');
    mtlLoader.load('mirror.mtl', function(materials) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        // objLoader.setMaterials(materials);
        objLoader.setPath('./resources/obj/');
        var o;
        objLoader.load('mirror.obj', function(object) {
            // console.log(object);
            o = object.children[0];
            o.scale.set(10, 10, 10);
            o.position.z = 5;
            o.position.y = 7;
            o.position.x = 0;
            o.rotation.y = -Math.PI / 2;
            o.rotation.z = Math.PI / 2;
            o.rotation.x = Math.PI / 2;
            o.traverse(function(child) {

                if (child instanceof THREE.Mesh) {

                    child.material = materials;

                }
            });

            console.log(o);
            scene.add(o);


        }, onProgress, onError);
    });



    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
    player = new THREE.Object3D;
    scene.add(player);
    player.add(camera);
    raycaster = new THREE.Raycaster();
    group = new THREE.Group();
    scene.add(group);

console.log(player.position);
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

    controller1.addEventListener('triggerdown', onTriggerDown);
    controller1.addEventListener('triggerup', onTriggerUp);
    controller2.addEventListener('triggerdown', onTriggerDown);
    controller2.addEventListener('triggerup', onTriggerUp);
    // camContainer.add(controller1);
    // camContainer.add(controller2);
    player.add(controller1);
    player.add(controller2);
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
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, -1));

    var line = new THREE.Line(geometry);
    line.name = 'line';
    line.scale.z = 5;
    controller1.add(line.clone());
    controller2.add(line.clone());

    //floor

    var geometry = new THREE.PlaneBufferGeometry(34, 34);

    var marbleMat = new THREE.MeshStandardMaterial({
        aoMap: marAO,
        displacementMap: marDisplacement,
        map: marBase,
        normalMap: marNormal,
        roughnessMap: marRoughness
    });

    var floor = new THREE.Mesh(geometry, marbleMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.position.set(0, -1, 0);
    floor.tag = "floor";
    group.add(floor);


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

    skybox = new THREE.Mesh(geometry, material);
    skybox.position.set(0, 30, 0);
    scene.add(skybox);

    //skybox Layer 2
    var geometry = new THREE.SphereGeometry(980, 60, 40);
    geometry.scale(-1, 1, 1);

    var material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.3,
        map: new THREE.TextureLoader().load('./resources/clouds/clouds1.png')
    });

    skyboxLayer2 = new THREE.Mesh(geometry, material);
    skyboxLayer2.position.set(0, 34, 0);
    scene.add(skyboxLayer2);

    //clipping plane
    localPlane = new THREE.Plane(new THREE.Vector3(-.5, 0, 0), .5);
    renderer.localClippingEnabled = true;


    //cube
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshPhongMaterial({
        color: 0x2194CE,
        shininess: 100,
        side: THREE.DoubleSide,
        clippingPlanes: [localPlane],
        clipShadows: true
    });
    cube = new THREE.Mesh(geometry, material);
    // cube.dynamic = true;
    cube.position.z = 5;
    cube.position.y = 2;
    cube.name = "rotatebox";
    group.add(cube);
}

function render() {

    controller1.update();
    controller2.update();
    controls.update();
    effect.render(scene, camera);
    // var timer = Date.now() * 0.0001;
    // cube.rotation.x = Math.cos(timer) * 5;
    // cube.rotation.z = Math.sin(timer) * 5;
    skyboxLayer2.rotation.y -= .0005;
    skybox.rotation.y += .00007;

}

function animate() {
    effect.requestAnimationFrame(animate);
    render();
}


//raycasting/interaction
function onTriggerDown(event) {
    var controller = event.target;
    var intersections = getIntersections(controller);
    if (intersections.length > 0) {
        var intersection = intersections[0];

        tempMatrix.getInverse(controller.matrixWorld);
        var object = intersection.object;
        if (object.tag != "floor") {
            object.matrix.premultiply(tempMatrix);
            object.matrix.decompose(object.position, object.quaternion, object.scale);
            // object.material.emissive.b = 1;
            controller.add(object);
            controller.userData.selected = object;
        } else {
            player.position.set(intersection.point.x, 0, intersection.point.z)
            // console.log();
        }
    }

}

function onTriggerUp(event) {
    var controller = event.target;
    if (controller.userData.selected !== undefined) {
        var object = controller.userData.selected;
        object.matrix.premultiply(controller.matrixWorld);
        object.matrix.decompose(object.position, object.quaternion, object.scale);
        // object.material.emissive.b = 0;
        group.add(object);
    }
    controller.userData.selected = undefined;
}


function getIntersections(controller) {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    return raycaster.intersectObjects(group.children);
}

function intersectObjects(controller) {
    // Do not highlight when already selected
    if (controller.userData.selected !== undefined) return;
    var line = controller.getObjectByName('line');
    var intersections = getIntersections(controller);
    if (intersections.length > 0) {
        var intersection = intersections[0];
        console.log(intersection.point);
        var object = intersection.object;
        object.material.emissive.r = 1;
        intersected.push(object);
        line.scale.z = intersection.distance;
    } else {
        line.scale.z = 5;
    }

}

function cleanIntersected() {
    while (intersected.length) {
        var object = intersected.pop();

    }
}

//helpers

var onProgress = function(xhr) {

    if (xhr.lengthComputable) {

        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log(Math.round(percentComplete, 2) + '% downloaded');

    }

};

var onError = function(xhr) {};

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    effect.setSize(window.innerWidth, window.innerHeight);
}
