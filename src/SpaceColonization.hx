package;

/**
 * ...
 * @author Mike Almond | https://github.com/mikedotalmond
 */

 /*
https://github.com/nicknikolov/pex-space-colonization/blob/master/index.js
http://algorithmicbotany.org/papers/colonization.egwnp2007.html
*/

import hxmath.math.*;

typedef SCOptions = {
	var type:SCType;
	var deadZone:Float;
	var growthStep:Float;
	var splitChance:Float;
	var numHormones:Int;
	var startBuds:Int;
	var centerRadius:Float;
	@:optional var budPositions:Array<Vector3>;
	@:optional var hormonePositions:Array<Vector3>;
	var viewAngle:Float;
	var branchAngle:Float;
	var viewDistance:Float;
	var growType:SCGrowType;
}

enum SCGrowType {
	SPLIT;
	NO_SPLIT;
}

enum SCType {
	_2D;
	_3D;
}

typedef SCData = {
	var buds:Array<Bud>;
	var hormones:Array<Hormone>;
}

typedef Bud = {
	var state:Int;
	var position:Vector3;
	@:optional var split:Bool;
	@:optional var hormones:Array<Hormone>;
	@:optional var parentPos:Vector3;
	@:optional var direction:Vector3;
}

typedef Hormone = {
	var state:Int;
	var position:Vector3;
}


class SpaceColonization {
	
	public static var DefaultOptions(default, never):SCOptions = {
		type : SCType._2D,
		deadZone : .1,
		growthStep : .02,
		splitChance : .4,
		numHormones : 800,
		startBuds : 1,
		centerRadius : 1,
		budPositions : null,
		hormonePositions : null,
		viewAngle : 0.873, //50
		branchAngle : 0.524, //30,
		viewDistance : .3,
		growType : SCGrowType.SPLIT,
	};
	
	public var options(default, null):SCOptions;
	
	var avgVec:Vector3;
	var buds:Array<Bud>;
	var hormones:Array<Hormone>;
	var hormonesForBud:Array<Array<Int>>;
	
	
	public function new(?options:SCOptions = null){
		restart(options);
	}
	
	
	public function restart(?opt:SCOptions = null) {
		
		if (opt != null) options = opt;
		if (options == null) options = DefaultOptions;
		
		generateHormones();
		generateBuds();
	}
	
	
	function generateBuds(){
		
		buds = [];
		var length = options.budPositions!=null ? options.budPositions.length : options.startBuds;
		
		if (options.budPositions != null) {
			for (i in 0...length) {
				buds.push({ state: 0, position: options.budPositions[i].clone(), parentPos: null});
			}
		} else {
			var pos;
			for (i in 0...length) {
				pos = randomVec3(options.centerRadius);
				if (options.type == SCType._2D) pos.z = 0;
				buds.push({ state: 0, position: pos, parentPos: null});
			}
		}
	}
	
	
	function generateHormones(){
		
		var positions = options.hormonePositions;
		
		hormones = [];
		var length = (positions != null && positions.length > 0) ? positions.length : options.numHormones;
		
		if (positions != null && positions.length > 0) {
			// user defined hormone positions
			var pos;
			for (i in 0...length) {
				pos = positions[i].clone();
				hormones.push({ state: 0, position: pos });
			}
			
		} else {
			
			var i = 0;
			while (i < length){
				// random hormone positions around 0,0
				var pos:Vector3 = randomVec3(options.centerRadius);
				if (options.type == SCType._2D) pos.z = 0;
				
				hormones.push({ state: 0, position: pos });
				i++;
			}
		}
	}
	

	function findAttractors(){

		hormonesForBud = [];
		for (i in 0...buds.length) hormonesForBud.push([]);
		
		for (i in 0...hormones.length) {
			
			var hormone = hormones[i];
			if (hormone.state != 0) continue;
			
			var minDistIndex = -1;
			var minDist = options.viewDistance;
			
			for (j in 0...buds.length) {
				
				var bud = buds[j];
				if (bud.state > 0) continue;
				
				var dist = hormone.position.distanceTo(bud.position);
				
				if (bud.direction != null) {
					var budPosDirNorm = bud.direction.clone().normalize();
					var hormPosNorm = (hormone.position - bud.position).normalize();
					var dot = Vector3.dot(budPosDirNorm, hormPosNorm);
					var angle = Math.acos(dot);
					if (angle > options.viewAngle * 2)  continue;
				}
				
				if (dist < minDist) {
					minDist = dist;
					minDistIndex = j;
				}
			}

			if (minDistIndex == -1) continue;

			hormonesForBud[minDistIndex].push(i);
			if (minDist < options.deadZone && minDistIndex != -1) {
				hormone.state++;
			}
		}
	}
	

	function calculateAverageVec(index:Int) {

		var avgPosCount = 0;
		var avgPos = new Vector3(0, 0, 0);
		
		for (i in 0...hormonesForBud[index].length) {
			var hormone = hormones[hormonesForBud[index][i]];
			avgPos += hormone.position;
			avgPosCount++;
		}
		
		avgVec = avgPos * (1 / avgPosCount);
	}
	
	
	function nextDirection(budPos:Vector3, rotate:Bool):Vector3 {

		var dir = avgVec - budPos;
		dir.normalizeTo(options.growthStep);
		
		if (rotate && options.growType == SCGrowType.SPLIT) {
			var a = options.branchAngle;
			var sin = Math.sin(a);
			var cos = Math.cos(a);
			dir.x = dir.x * cos + dir.y * sin;
			dir.y = -( dir.x * sin) + dir.y * cos;
		}
		
		return dir;
	}
	
	
	function nextDirectionForBranch(budPos:Vector3):Vector3 {

		var dir = avgVec - budPos;
		var a = -options.branchAngle;
		var sin = Math.sin(a);
		var cos = Math.cos(a);
		
		dir.normalizeTo(options.growthStep);
		
		dir.x = dir.x * cos + dir.y * sin;
		dir.y = -( dir.x * sin) + dir.y * cos;
		
		return dir;
	}

	
	function splitBranch(parentPos:Vector3):Bool {

		if (Math.random() > (1.0 - options.splitChance)) {
			
			var branchNextDir = nextDirectionForBranch(parentPos);
			var branchNextPos = parentPos + branchNextDir;
			
			buds.push({
				state: 0,
				position: branchNextPos,
				parentPos: parentPos,
				split: true
			});
			
			return true;
		} 
		
		return false;
	}
	

	public function iterate():SCData {

		findAttractors();
		
		for (i in 0...buds.length) {
			
			var bud = buds[i];
			if (bud.state == 1) continue;
			
			if (hormonesForBud[i].length == 0) {
				if (bud.hormones != null) bud.hormones = [];
				bud.state++;
				continue;
			}
			
			var budPos = bud.position.clone();
			calculateAverageVec(i);
			
			var didSplit = splitBranch(budPos);
			var nextDir = nextDirection(budPos, didSplit);
			var nextPos = budPos + nextDir;

			bud.state++;
			buds.push({
				state:      0,
				position:   nextPos,
				parentPos:  bud.position
			});
			
			bud.hormones = hormonesForBud[i].map(function(i) { return hormones[i]; });
		}
		
		return { buds: buds, hormones: hormones }
	}
	
	
	// random position on the surface of a sphere
	public static inline function randomSurfaceVec3(scale:Float=1.0){
		return new Vector3(Math.random()-.5, Math.random()-.5, Math.random()-.5).normalizeTo(scale);
	}
	
	// random position within the volume of a sphere
	public static function randomVec3(scale:Float = 1.0){
		var x = 2 * Math.random() - 1;
		var y = 2 * Math.random() - 1;
		var z = 2 * Math.random() - 1;
		var rr = Math.random();
		var len = Math.sqrt(x*x + y*y + z*z);
		return new Vector3(rr * x/len, rr * y/len, rr * z/len).multiplyWith(scale);
	}
}