
var stats, scene, renderer, composer;
var camera, cameraControl;

if( !init() )	animate();

// init the scene
function init(){

	if( Detector.webgl ){
		renderer = new THREE.WebGLRenderer({
			antialias		: true,	// to get smoother output
			preserveDrawingBuffer	: true	// to allow screenshot
		});
	}else{
		renderer	= new THREE.CanvasRenderer();
	}
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById('container').appendChild(renderer.domElement);

	// add Stats.js - https://github.com/mrdoob/stats.js
	stats = new Stats();
	stats.domElement.style.position	= 'absolute';
	stats.domElement.style.bottom	= '0px';
	document.body.appendChild( stats.domElement );

	// create a scene
	scene = new THREE.Scene();

	// put a camera in the scene
	camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set(0, 0, 5);
	scene.add(camera);

	// create a camera contol
	//cameraControls	= new THREEx.DragPanControls(camera)

	// transparently support window resize
	THREEx.WindowResize.bind(renderer, camera);
	// allow 'p' to make screenshot
	THREEx.Screenshot.bindKey(renderer);
	// allow 'f' to go fullscreen where this feature is supported
	if( THREEx.FullScreen.available() ){
		THREEx.FullScreen.bindKey();		
		document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
	}

	// here you add your objects
	// - you will most likely replace this part by your own
	var light	= new THREE.AmbientLight( Math.random() * 0xffffff );
	scene.add( light );
	var light	= new THREE.DirectionalLight( Math.random() * 0xffffff );
	light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
	scene.add( light );
	var light	= new THREE.DirectionalLight( Math.random() * 0xffffff );
	light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
	scene.add( light );
	var light	= new THREE.PointLight( Math.random() * 0xffffff );
	light.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
				.normalize().multiplyScalar(1.2);
	scene.add( light );
	var light	= new THREE.PointLight( Math.random() * 0xffffff );
	light.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
				.normalize().multiplyScalar(1.2);
	scene.add( light );

	var geometry	= new THREE.TorusGeometry( 1, 0.42, 16, 16 );
	var material	= new THREE.MeshLambertMaterial({ambient: 0x808080, color: Math.random() * 0xffffff});
	var mesh	= new THREE.Mesh( geometry, material ); 
	scene.add( mesh );

	// define the stack of passes for postProcessing
	composer = new THREE.EffectComposer( renderer );
	renderer.autoClear = false;

	var renderModel	= new THREE.RenderPass( scene, camera );
	composer.addPass( renderModel );

	var effectBloom = new THREE.BloomPass( 1.5 );
	composer.addPass( effectBloom );

	var effectScreen= new THREE.ShaderPass( THREE.ShaderExtras[ "screen" ] );
	effectScreen.renderToScreen = true;
	composer.addPass( effectScreen );
}

// animation loop
function animate() {

	// loop on request animation loop
	// - it has to be at the begining of the function
	// - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	requestAnimationFrame( animate );

	// do the render
	render();

	// update stats
	stats.update();
}

// render the scene
function render() {
	// variable which is increase by Math.PI every seconds - usefull for animation
	var PIseconds	= Date.now() * Math.PI;

	// update camera controls
	//cameraControls.update();

	// animation of all objects
	/*for( var i = 0; i < scene.objects.length; i ++ ){
		scene.objects[ i ].rotation.y = PIseconds*0.0003 * (i % 2 ? 1 : -1);
		scene.objects[ i ].rotation.x = PIseconds*0.0002 * (i % 2 ? 1 : -1);
	}*/


	// animate DirectionalLight
	scene.lights.forEach(function(light, idx){
		if( light instanceof THREE.DirectionalLight === false )	return;
		var ang	= 0.0005 * PIseconds * (idx % 2 ? 1 : -1);
		light.position.set(Math.cos(ang), Math.sin(ang), Math.cos(ang*2)).normalize();							
	});
	// animate PointLights
	scene.lights.forEach(function(light, idx){
		if( light instanceof THREE.PointLight === false )	return;
		var angle	= 0.0005 * PIseconds * (idx % 2 ? 1 : -1) + idx * Math.PI/3;
		light.position.set(Math.cos(angle)*3, Math.sin(angle*3)*2, Math.cos(angle*2)).normalize().multiplyScalar(2);
	});

	// actually render the scene
	renderer.clear();
	composer.render();
}

var Game = function(dom) {
	userid = false;

	var rotate = function (dir) 
	{
		for( var i = 0; i < scene.objects.length; i ++ ){
			scene.objects[ i ].rotation.y = PIseconds*0.0003 * (i % 2 ? 1 : -1);
			scene.objects[ i ].rotation.x = PIseconds*0.0002 * (i % 2 ? 1 : -1);
		}
	}


	var requestUserid = function() {
		console.log("connecting....");
		jQuery.ajax({ 
			url : "http://192.168.50.12:8001/newuser",
			success: function(res) {
				userid = res.user;
				generateQR();
				console.log("connected, generating QR");
			}
		});
	}

	var generateQR = function() 
	{ 

		var img = showQRCode("http://192.168.50.12:8001/"+userid);
		dom.qrwrapper.appendChild(img);
		dom.qrcode = img;
		jQuery(dom.qrcode).click(function() { jQuery(this).toggle(); })
	}

	requestUserid();
}

var game = new Game({ 
	qrwrapper : document.getElementById("qr"),
	closeBtn : document.getElementById("closeBtn"),
	connectBtn : document.getElementById("connectBtn")
});