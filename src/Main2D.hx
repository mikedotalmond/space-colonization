package;

import haxe.Timer;
import hxmath.math.Vector3;
import js.html.*;
import js.Browser;
import js.Lib;

import SpaceColonization.SCData;
import SpaceColonization.SCOptions;
import SpaceColonization.SCType;
import SpaceColonization.SCGrowType;
/**
 * ...
 * @author Mike Almond | https://github.com/mikedotalmond
 */
class Main2D {
	
	var canvas:CanvasElement;
	var context:CanvasRenderingContext2D;
	var sc:SpaceColonization;
	
	var firstPass:Bool = true;
	var complete:Bool = false;
	var lastBudCount:Int = 0;
	var completeTime:Float = 0;
	var lastTime:Float = 0;
	var size:Int;
	
	public function new(){
		
		var config:SCOptions = {
			type : SCType._2D,
			deadZone : .15,
			growthStep : .02,
			splitChance : .27,
			numHormones : 2000,
			startBuds :1,
			centerRadius : 1,
			viewAngle : 0.873, //50
			branchAngle : 0.324, //30,
			viewDistance : .2,
			growType : SCGrowType.SPLIT,
			//budPositions:[new Vector3(0, 0, 0)],
			hormonePositions : null,
		};
		
		//sc = new SpaceColonization();
		sc = new SpaceColonization(config);
		
		size = 800;
		setupCanvas();
		
		Browser.window.requestAnimationFrame(tick);
		Browser.document.body.addEventListener('click', function(_){ reset(); });
	}
	
	
	function setupCanvas() {
		
		canvas = Browser.document.createCanvasElement();
		canvas.width = size;
		canvas.height = size;
		canvas.style.margin = '0 auto';
		canvas.style.display = 'block';
		
		var container = Browser.document.getElementById('container');
		container.appendChild(canvas);
		
		context = canvas.getContext2d();
	}
	
	
	function tick(t:Float) {
		
		Browser.window.requestAnimationFrame(tick);
		
		var dt = t - lastTime;
		lastTime = t;
		
		if (complete){
			completeTime += dt;
			if (completeTime > 4000) reset();
			return;
		}
		
		var data = sc.iterate();
		var halfSize = size >> 1;
		
		
		if (firstPass) {
			
			context.clearRect(0, 0, size, size);
			
			context.fillStyle = '#f1f1f1';
			for (h in data.hormones){
				context.fillRect(halfSize + h.position.x * halfSize, halfSize + h.position.y * halfSize, 4, 4);
			}
		}
		
		context.strokeStyle = '#ccc';
		context.fillStyle = '#eee';
		
		var count = data.buds.length;
		var lastp:Vector3 = null;
		
		
		for (i in lastBudCount...count){
		//for (bud in data.buds){
			//bud.state
			var bud = data.buds[i];
			var p = bud.position;
			
			if (lastp != null){
				context.strokeStyle = 'rgba(0,0,80,.05)';
				context.beginPath();
				context.moveTo(halfSize+lastp.x * halfSize, halfSize+lastp.y * halfSize);
				context.lineTo(halfSize + p.x * halfSize, halfSize + p.y * halfSize);
				context.closePath();
				context.stroke();
			}
			
			if (bud.parentPos != null) {
				// draw branch sections between buds
				context.strokeStyle = '#808080';
				context.beginPath();
				context.moveTo(halfSize + bud.parentPos.x * halfSize, halfSize + bud.parentPos.y * halfSize);
				context.lineTo(halfSize + p.x * halfSize, halfSize + p.y * halfSize);
				context.closePath();
				context.stroke();
			} 
			
			if (bud.state == 0){ // alive/growing
				context.fillStyle = 'rgba(0,0,0,.1)';
				context.fillRect(halfSize + p.x * halfSize-2, halfSize + p.y * halfSize-2, 4, 4);
			}
			
			lastp = p;
		}
		
		
		if (lastBudCount > 0 && lastBudCount == count){
			complete = true;
		}
		
		firstPass = false;
		lastBudCount = count;
	}
	
	
	function reset(){
		trace('reset');
		completeTime = 0;
		complete = false;
		firstPass = true;
		lastBudCount = 0;
		sc.restart();
	}
}