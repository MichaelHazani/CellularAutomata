var camera, scene, renderer;
var controls;
var cube;
var globalPlane, localPlane;
init();

render();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    scene.add(camera);
    renderer = new THREE.WebGLRenderer({
        antialiasing: true
    });
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls = new THREE.OrbitControls(camera);
    document.getElementById("container").appendChild(renderer.domElement);


    //light
    var light = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(light);
    light.position.y = 30;
    var ambi = new THREE.AmbientLight(0xffffff);
    scene.add(ambi);

//clipping planes

    localPlane = new THREE.Plane(new THREE.Vector3(0, 2, 0), 0.8);
    globalPlane = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 1 );
    console.log(localPlane);
    renderer.clippingPlanes = [ localPlane ];

    renderer.localClippingEnabled = true;


    //sphere
    var geometry = new THREE.BoxGeometry(5, 5, 5);
    var material = new THREE.MeshPhongMaterial({
        color: 0x2194CE,
        shininess: 100,
        side: THREE.DoubleSide,
        clippingPlanes: [localPlane],
        clipShadows: true
    });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 30;

}

function render() {
    var timer = Date.now() * 0.0001;
    renderer.render(scene, camera);
    controls.update();

    cube.rotation.x = Math.cos(timer) * 5;

    cube.rotation.z = Math.sin(timer) * 5;
// localPlane.normal.y = Math.cos(timer) * 5;
    requestAnimationFrame(render);
    // console.log(camera.position);

}
