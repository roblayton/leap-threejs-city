define(['proj/Building', 'proj/District', 'core/utils/Mapper', 'threejs', 'Leap', 'use!TrackballControls'], function(Building, District, Mapper) {
	var ThreeController = function(container, options) {
		options = options || {};
		var self = this;
		var callback = options.callbacks.onRender;
		var selection;
		var selected;
		var t;
		var isGrabbing = false;
		var isOffscreen = true;

		// Scene
		var scene = new THREE.Scene();
		// ------
		// Camera
		var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 3000);
		camera.lookAt(scene.position);
		camera.position.set(0, 250, 300);

		var startFrame = null;
		var camRadius = 690;
		var rotateY = 90;
		var rotateX = 0;
		var curY = 0;
		var fov = camera.fov;

		var active = false;
		// ------
		// Renderer
		var renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMapEnabled = true;
		container.appendChild(renderer.domElement);
		// ------
		// Controls
		var controls = new THREE.TrackballControls(camera, renderer.domElement);
		controls.target.set(0, 100, 0);
		// ------
		// Canvas
		var canvas = container.getElementsByTagName('canvas')[0];
		var width = canvas.width;
		var height = canvas.height;
		// ------
		var light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set( - 1, - 1, - 1).normalize();

		light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(0, 500, 0);
		light.castShadow = true;
		light.shadowMapWidth = 2048;
		light.shadowMapHeight = 2048;
		var d = 200;
		light.shadowCameraLeft = - d;
		light.shadowCameraRight = d;
		light.shadowCameraTop = d * 2;
		light.shadowCameraBottom = - d * 2;

		light.shadowCameraNear = 100;
		light.shadowCameraFar = 600;
		light.shadowCameraVisible = true;

		// Geometry
		var material, geometry, mesh;

		// Ground plane
		material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			wireframe: true
		});

		geometry = new THREE.CubeGeometry(2300, 10, 2300);
		mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(0, - 10, 0);
		scene.add(mesh);

		// District
		var districtA = new District(1000, 0x0A8559);
		scene.add(districtA);

		var districtB = new District(1000, 0x0B5757);
		scene.add(districtB);

		// Palm		
		geometry = new THREE.CubeGeometry(100, 20, 80);
		material = new THREE.MeshNormalMaterial({
			wireframe: true
		});
		//material.opacity = 0.5;
		var palm = new THREE.Mesh(geometry, material);
		scene.add(palm);

		// Fingers		
		var fingers = [];
		geometry = new THREE.CubeGeometry(16, 12, 1);
		for (var i = 0; i < 5; i++) {
			mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);
			fingers.push(mesh);
		}

		// Gestures
		var gesture = '',
		lastGesture = '';

		Leap.loop(function(frame) {
			var hand, direction, len;
			if (frame.hands.length > 0) {
				hand = frame.hands[0];
				palm.position.set(hand.stabilizedPalmPosition[0], hand.stabilizedPalmPosition[1], hand.stabilizedPalmPosition[2]);
				direction = v(hand.direction[0], hand.direction[1], hand.direction[2]); // best so far
				palm.lookAt(direction.add(palm.position));
				palm.rotation.z = - hand.roll();
				palm.rotation.set(hand.pitch(), - hand.yaw(), hand.roll());
				palm.visible = true;
				isOffscreen = true;

				if (frame.pointables.length === 0) {
					gesture = '';
					isGrabbing = true;
				}
			} else {
				palm.visible = false;
				gesture = '';
				isOffscreen = true;
			}

			len = frame.pointables.length;
			var i;
			if (len > 0) {
				var pointable;
				palm.hasFingers = true;
				for (i = 0; i < 5; i++) {
					finger = fingers[i];
					if (i < len) {
						pointable = frame.pointables[i];
						finger.position.set(pointable.stabilizedTipPosition[0], pointable.stabilizedTipPosition[1], pointable.stabilizedTipPosition[2]);
						direction = v(pointable.direction[0], pointable.direction[1], pointable.direction[2]);
						finger.lookAt(direction.add(finger.position));
						finger.scale.z = pointable.length;
						finger.visible = true;
					} else {
						finger.visible = false;
					}
				}

				if (len === 1 || len === 2) {
					gesture = 'SELECTING DISTRICT A';
					selection = districtA;
				} else if (len === 3 || len === 4) {
					gesture = 'SELECTING DISTRICT B';
					selection = districtB;
				} else if (len === 5) {
					gesture = 'DESELECTING';
					selection = null;
				}
				isOffscreen = false;
			} else if (palm.hasFingers) {
				for (i = 0; i < 5; i++) {
					fingers[i].visible = false;
				}
				palm.hasFingers = false;
			}

			if (gesture != lastGesture) {
				lastGesture = gesture;
				if (selection) {
					startTimer(function() {
						selectDistrict(selection);
					});
					isGrabbing = false;
				} else {
					if (selected) {
						startTimer(function() {
							deselectDistrict(selection);
						});
						isGrabbing = false;
					} else {}
				}
				if (options.callbacks.onGesture) {
					options.callbacks.onGesture(gesture);
				}

			}

			if (options.callbacks.onRender) {
				options.callbacks.onRender();
			}

			// Camera
			if (!active) {

				startFrame = frame;
				active = true;
			} else {
				var f = startFrame.translation(frame);

				// Limit y-axis betwee 0 and 180 degrees
				curY = Mapper.map(f[1], - 300, 300, 0, 179);

				// Assign rotation coordinates
				rotateX = f[0];
				rotateY = - curY;

				var zoom = Math.max(0, f[2] + 200);
				var zoomFactor = 1 / (1 + (zoom / 150));
				// Adjust 3D spherical coordinates of the camera
				var newX = camRadius * Math.sin(rotateY * Math.PI / 180) * Math.cos(rotateX * Math.PI / 180);
				var newZ = camRadius * Math.sin(rotateY * Math.PI / 180) * Math.sin(rotateX * Math.PI / 180);
				var newY = camRadius * Math.cos(rotateY * Math.PI / 180);

				TweenMax.to(camera.position, 1, {
					x: newX,
					//y: newY,
					z: newZ
				});
				camera.fov = fov * zoomFactor;
			}

			if (isGrabbing && selected) {
				TweenMax.to(selected.position, 1, {
					y: palm.position.y
				});
			} else {
				TweenMax.to(districtA.position, 1, {
					y: 0
				});
				TweenMax.to(districtB.position, 1, {
					y: 0
				});
			}
		});

		var startTimer = function(callback) {
			clearTimeout(t);
			t = setTimeout(function() {
				if (!isGrabbing || ! isOffscreen) {
					callback();
				}
			},
			1000);
		};

		var deselectDistrict = function() {
			districtA.material.color.setHex(0x0A8559);
			districtB.material.color.setHex(0x0B5757);

			selected = null;
		};

		var selectDistrict = function(city) {
			deselectDistrict();
			if (city) {
				city.material.color.setHex(0xFF5543);
				selected = city;
			}
		};

		var animate = function() {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		};

		var v = function(x, y, z) {
			return new THREE.Vector3(x, y, z);
		};

		animate();
	};

	return ThreeController;
});

