package;

import js.html.*;
import js.Browser;
import js.Lib;

import js.three.Geometry;
import js.three.LineBasicMaterial;
import js.three.LineSegments;
import js.three.Object3D;
import js.three.PerspectiveCamera;
import js.three.Scene;
import js.three.WebGLRenderer;

import js.three.Three;

import SpaceColonization.SCData;
import SpaceColonization.SCOptions;
import SpaceColonization.SCType;
import SpaceColonization.SCGrowType;

/**
 * ...
 * @author Mike Almond | https://github.com/mikedotalmond
 */
class Main3D {
	
	var canvas:CanvasElement;
	var context:CanvasRenderingContext2D;
	var sc:SpaceColonization;
	
	var complete:Bool = false;
	var lastBudCount:Int = 0;
	
	var lines:Object3D;
	var scene:js.three.Scene;
	var camera:js.three.PerspectiveCamera;
	var renderer:WebGLRenderer;
	var material:LineBasicMaterial;
	var completeTime:Float = 0;
	var config:SCOptions;
	
	public function new(){
		
		config = {
			type : SCType._3D,
			deadZone : .2,
			growthStep : .02,
			splitChance : .15,
			numHormones : 1500,
			startBuds :1,
			centerRadius : 1,
			budPositions : [SpaceColonization.randomSurfaceVec3()],
			hormonePositions : [for(i in 0...2500) SpaceColonization.randomSurfaceVec3()],
			viewAngle : 0.873, //50
			branchAngle : 0.324, //30,
			viewDistance : .25,
			growType : SCGrowType.SPLIT,
		};
		
		sc = new SpaceColonization(config);
		
		initThree();
		
		resize(Browser.window.innerWidth, Browser.window.innerHeight);
		
		Browser.document.body.addEventListener('resize', function(_){resize(Browser.window.innerWidth, Browser.window.innerHeight); });
		Browser.document.body.addEventListener('click', function(_){reset(); });
	}
	
	
	public function resize(w:Int, h:Int) {
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
	}
	
	
	
	function animate(f:Float) {
		Browser.window.requestAnimationFrame( animate );
		render(f);
	}
	
	
	function initThree() {
		
		scene = new Scene();
		camera = new PerspectiveCamera( 70, Browser.window.innerWidth / Browser.window.innerHeight, 1, 10000 );
		renderer = new WebGLRenderer({
			antialias		: true,
			alpha			: false,
			devicePixelRatio: Browser.window.devicePixelRatio,
		});
		
		camera.position.z = 100;
		camera.lookAt(scene.position);
		
		var container = Browser.document.getElementById('container');
		container.appendChild(renderer.domElement);
		renderer.setClearColor(0x111111,1);
		
		lines = new Object3D();
		scene.add(lines);
		
		material = new LineBasicMaterial({
			color : 0xffffff,
			linewidth : 1.0,
		});
		
		animate(0);
	}
	
	var lastTime = .0;
	function render(t:Float) {
		
		var dt = t - lastTime;
		lastTime = t;
		
		if (!complete){
			
			var data = sc.iterate();			
			var count = data.buds.length;			
			var geometry = new Geometry();
			
			// only adding the new ones
			for (i in lastBudCount...count){
				
				var bud = data.buds[i];
				if (bud.parentPos != null) {
					
					var p = bud.position;
					var pp = bud.parentPos;
					// add vertex pair to describe this section
					geometry.vertices.push(cast new js.three.Vector3(pp.x, pp.y, pp.z).multiplyScalar(50));
					geometry.vertices.push(cast new js.three.Vector3(p.x, p.y, p.z).multiplyScalar(50));
				}
			}
			
			// create LineSegments for all the new points, add to scene
			var obj = new LineSegments(geometry, material);
			lines.add(obj);
			
			
			if (lastBudCount > 0 && lastBudCount == count){
				trace('complete');
				complete = true;
			}	
			
			lastBudCount = count;
			
		} else {
			completeTime += dt;
			if (completeTime > 5000) reset();			
		}
		
		
		scene.rotateX(.004);
		scene.rotateZ(.0028);
		scene.rotateY(.001);
		
		renderer.clear();
		renderer.render(scene, camera);
	}
	
	
	function reset() {
		
		trace('reset');
		
		complete = false;
		lastBudCount = 0;
		completeTime = 0;
		
		var r = Math.random() > .5 ? SpaceColonization.randomVec3 : SpaceColonization.randomSurfaceVec3;
		var hCount = Std.int(1000 + Math.random()*1500);
		
		if (r == SpaceColonization.randomSurfaceVec3 && Math.random() > .5){
			config.hormonePositions = [for (i in 0...hCount) r()];
			config.viewDistance = .25+Math.random()*2;
		} else {
			config.hormonePositions = [for (i in 0...hCount) r(i / hCount)];
			config.viewDistance = .25+Math.random()*25;
		}
		
		config.budPositions[0] = r();
		config.splitChance = .1+Math.random() * Math.random() * .3;
		config.growType = Math.random() > .5?SCGrowType.NO_SPLIT:SCGrowType.SPLIT;
		
		sc.restart(config);
		
		scene.remove(lines);
		lines = new Object3D();
		scene.add(lines);
	}
}