(function (console) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
var Main = function() {
	var s = window.document.location.search;
	var _g = window.document.location.search;
	switch(_g) {
	case "?3d":
		new Main3D();
		this.setupPage("2d","white");
		break;
	case "?2d":
		new Main2D();
		this.setupPage("3d");
		break;
	default:
		window.document.location.search = "?2d";
	}
};
Main.__name__ = true;
Main.main = function() {
	new Main();
};
Main.prototype = {
	setupPage: function(type,className) {
		var info = window.document.getElementsByClassName("info").item(0);
		var footer = window.document.getElementsByClassName("footer").item(0);
		var a;
		var _this = window.document;
		a = _this.createElement("a");
		a.href = "?" + type;
		a.text = type;
		if(className != null) {
			info.classList.add(className);
			footer.classList.add(className);
		}
		info.appendChild(a);
	}
};
var Main2D = function() {
	this.lastTime = 0;
	this.completeTime = 0;
	this.lastBudCount = 0;
	this.complete = false;
	this.firstPass = true;
	var _g = this;
	var config = { type : SCType._2D, deadZone : .15, growthStep : .02, splitChance : .27, numHormones : 2000, startBuds : 1, centerRadius : 1, viewAngle : 0.873, branchAngle : 0.324, viewDistance : .2, growType : SCGrowType.SPLIT, hormonePositions : null};
	this.sc = new SpaceColonization(config);
	this.size = 800;
	this.setupCanvas();
	window.requestAnimationFrame($bind(this,this.tick));
	window.document.body.addEventListener("click",function(_) {
		_g.reset();
	});
};
Main2D.__name__ = true;
Main2D.prototype = {
	setupCanvas: function() {
		var _this = window.document;
		this.canvas = _this.createElement("canvas");
		this.canvas.width = this.size;
		this.canvas.height = this.size;
		this.canvas.style.margin = "0 auto";
		this.canvas.style.display = "block";
		var container = window.document.getElementById("container");
		container.appendChild(this.canvas);
		this.context = this.canvas.getContext("2d",null);
	}
	,tick: function(t) {
		window.requestAnimationFrame($bind(this,this.tick));
		var dt = t - this.lastTime;
		this.lastTime = t;
		if(this.complete) {
			this.completeTime += dt;
			if(this.completeTime > 4000) this.reset();
			return;
		}
		var data = this.sc.iterate();
		var halfSize = this.size >> 1;
		if(this.firstPass) {
			this.context.clearRect(0,0,this.size,this.size);
			this.context.fillStyle = "#f1f1f1";
			var _g = 0;
			var _g1 = data.hormones;
			while(_g < _g1.length) {
				var h = _g1[_g];
				++_g;
				this.context.fillRect(halfSize + h.position.x * halfSize,halfSize + h.position.y * halfSize,4,4);
			}
		}
		this.context.strokeStyle = "#ccc";
		this.context.fillStyle = "#eee";
		var count = data.buds.length;
		var lastp = null;
		var _g2 = this.lastBudCount;
		while(_g2 < count) {
			var i = _g2++;
			var bud = data.buds[i];
			var p = bud.position;
			if(lastp != null) {
				this.context.strokeStyle = "rgba(0,0,80,.05)";
				this.context.beginPath();
				this.context.moveTo(halfSize + lastp.x * halfSize,halfSize + lastp.y * halfSize);
				this.context.lineTo(halfSize + p.x * halfSize,halfSize + p.y * halfSize);
				this.context.closePath();
				this.context.stroke();
			}
			if(bud.parentPos != null) {
				this.context.strokeStyle = "#808080";
				this.context.beginPath();
				this.context.moveTo(halfSize + bud.parentPos.x * halfSize,halfSize + bud.parentPos.y * halfSize);
				this.context.lineTo(halfSize + p.x * halfSize,halfSize + p.y * halfSize);
				this.context.closePath();
				this.context.stroke();
			}
			if(bud.state == 0) {
				this.context.fillStyle = "rgba(0,0,0,.1)";
				this.context.fillRect(halfSize + p.x * halfSize - 2,halfSize + p.y * halfSize - 2,4,4);
			}
			lastp = p;
		}
		if(this.lastBudCount > 0 && this.lastBudCount == count) this.complete = true;
		this.firstPass = false;
		this.lastBudCount = count;
	}
	,reset: function() {
		console.log("reset");
		this.completeTime = 0;
		this.complete = false;
		this.firstPass = true;
		this.lastBudCount = 0;
		this.sc.restart();
	}
};
var Main3D = function() {
	this.lastTime = .0;
	this.completeTime = 0;
	this.lastBudCount = 0;
	this.complete = false;
	var _g1 = this;
	this.config = { type : SCType._3D, deadZone : .2, growthStep : .02, splitChance : .15, numHormones : 1500, startBuds : 1, centerRadius : 1, budPositions : [SpaceColonization.randomSurfaceVec3(null)], hormonePositions : (function($this) {
		var $r;
		var _g = [];
		{
			var _g11 = 0;
			while(_g11 < 2500) {
				var i = _g11++;
				_g.push(SpaceColonization.randomSurfaceVec3(null));
			}
		}
		$r = _g;
		return $r;
	}(this)), viewAngle : 0.873, branchAngle : 0.324, viewDistance : .25, growType : SCGrowType.SPLIT};
	this.sc = new SpaceColonization(this.config);
	this.initThree();
	this.resize(window.innerWidth,window.innerHeight);
	window.document.body.addEventListener("resize",function(_) {
		_g1.resize(window.innerWidth,window.innerHeight);
	});
	window.document.body.addEventListener("click",function(_1) {
		_g1.reset();
	});
};
Main3D.__name__ = true;
Main3D.prototype = {
	resize: function(w,h) {
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(w,h);
	}
	,animate: function(f) {
		window.requestAnimationFrame($bind(this,this.animate));
		this.render(f);
	}
	,initThree: function() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(70,window.innerWidth / window.innerHeight,1,10000);
		this.renderer = new THREE.WebGLRenderer({ antialias : true, alpha : false, devicePixelRatio : window.devicePixelRatio});
		this.camera.position.z = 100;
		this.camera.lookAt(this.scene.position);
		var container = window.document.getElementById("container");
		container.appendChild(this.renderer.domElement);
		this.renderer.setClearColor(1118481,1);
		this.lines = new THREE.Object3D();
		this.scene.add(this.lines);
		this.material = new THREE.LineBasicMaterial({ color : 16777215, linewidth : 1.0});
		this.animate(0);
	}
	,render: function(t) {
		var dt = t - this.lastTime;
		this.lastTime = t;
		if(!this.complete) {
			var data = this.sc.iterate();
			var count = data.buds.length;
			var geometry = new THREE.Geometry();
			var _g = this.lastBudCount;
			while(_g < count) {
				var i = _g++;
				var bud = data.buds[i];
				if(bud.parentPos != null) {
					var p = bud.position;
					var pp = bud.parentPos;
					geometry.vertices.push(new THREE.Vector3(pp.x,pp.y,pp.z).multiplyScalar(50));
					geometry.vertices.push(new THREE.Vector3(p.x,p.y,p.z).multiplyScalar(50));
				}
			}
			var obj = new THREE.LineSegments(geometry,this.material);
			this.lines.add(obj);
			if(this.lastBudCount > 0 && this.lastBudCount == count) {
				console.log("complete");
				this.complete = true;
			}
			this.lastBudCount = count;
		} else {
			this.completeTime += dt;
			if(this.completeTime > 5000) this.reset();
		}
		this.scene.rotateX(.004);
		this.scene.rotateZ(.0028);
		this.scene.rotateY(.001);
		this.renderer.clear();
		this.renderer.render(this.scene,this.camera);
	}
	,reset: function() {
		console.log("reset");
		this.complete = false;
		this.lastBudCount = 0;
		this.completeTime = 0;
		var r;
		if(Math.random() > .5) r = SpaceColonization.randomVec3; else r = SpaceColonization.randomSurfaceVec3;
		var hCount = Std["int"](1000 + Math.random() * 1500);
		if(r == SpaceColonization.randomSurfaceVec3 && Math.random() > .5) {
			var _g = [];
			var _g1 = 0;
			while(_g1 < hCount) {
				var i = _g1++;
				_g.push(r());
			}
			this.config.hormonePositions = _g;
			this.config.viewDistance = .25 + Math.random() * 2;
		} else {
			var _g2 = [];
			var _g11 = 0;
			while(_g11 < hCount) {
				var i1 = _g11++;
				_g2.push(r(i1 / hCount));
			}
			this.config.hormonePositions = _g2;
			this.config.viewDistance = .25 + Math.random() * 25;
		}
		this.config.budPositions[0] = r();
		this.config.splitChance = .1 + Math.random() * Math.random() * .3;
		if(Math.random() > .5) this.config.growType = SCGrowType.NO_SPLIT; else this.config.growType = SCGrowType.SPLIT;
		this.sc.restart(this.config);
		this.scene.remove(this.lines);
		this.lines = new THREE.Object3D();
		this.scene.add(this.lines);
	}
};
Math.__name__ = true;
var SCGrowType = { __ename__ : true, __constructs__ : ["SPLIT","NO_SPLIT"] };
SCGrowType.SPLIT = ["SPLIT",0];
SCGrowType.SPLIT.toString = $estr;
SCGrowType.SPLIT.__enum__ = SCGrowType;
SCGrowType.NO_SPLIT = ["NO_SPLIT",1];
SCGrowType.NO_SPLIT.toString = $estr;
SCGrowType.NO_SPLIT.__enum__ = SCGrowType;
var SCType = { __ename__ : true, __constructs__ : ["_2D","_3D"] };
SCType._2D = ["_2D",0];
SCType._2D.toString = $estr;
SCType._2D.__enum__ = SCType;
SCType._3D = ["_3D",1];
SCType._3D.toString = $estr;
SCType._3D.__enum__ = SCType;
var SpaceColonization = function(options) {
	this.restart(options);
};
SpaceColonization.__name__ = true;
SpaceColonization.randomSurfaceVec3 = function(scale) {
	if(scale == null) scale = 1.0;
	var this1;
	var x = Math.random() - .5;
	var y = Math.random() - .5;
	var z = Math.random() - .5;
	this1 = new hxmath_math_Vector3Default(x,y,z);
	var self = this1;
	var self1 = self;
	var length;
	var self2 = self1;
	length = Math.sqrt(self2.x * self2.x + self2.y * self2.y + self2.z * self2.z);
	if(length > 0.0) {
		var self3 = self1;
		self3.x /= length;
		self3.y /= length;
		self3.z /= length;
		self3;
	}
	self1;
	var self4 = self;
	self4.x *= scale;
	self4.y *= scale;
	self4.z *= scale;
	self4;
	return self;
};
SpaceColonization.randomVec3 = function(scale) {
	if(scale == null) scale = 1.0;
	var x = 2 * Math.random() - 1;
	var y = 2 * Math.random() - 1;
	var z = 2 * Math.random() - 1;
	var rr = Math.random();
	var len = Math.sqrt(x * x + y * y + z * z);
	var this1 = new hxmath_math_Vector3Default(rr * x / len,rr * y / len,rr * z / len);
	var self = this1;
	self.x *= scale;
	self.y *= scale;
	self.z *= scale;
	return self;
};
SpaceColonization.prototype = {
	restart: function(opt) {
		if(opt != null) this.options = opt;
		if(this.options == null) this.options = SpaceColonization.DefaultOptions;
		this.generateHormones();
		this.generateBuds();
	}
	,generateBuds: function() {
		this.buds = [];
		var length;
		if(this.options.budPositions != null) length = this.options.budPositions.length; else length = this.options.startBuds;
		if(this.options.budPositions != null) {
			var _g = 0;
			while(_g < length) {
				var i = _g++;
				this.buds.push({ state : 0, position : (function($this) {
					var $r;
					var self = $this.options.budPositions[i];
					$r = new hxmath_math_Vector3Default(self.x,self.y,self.z);
					return $r;
				}(this)), parentPos : null});
			}
		} else {
			var pos;
			var _g1 = 0;
			while(_g1 < length) {
				var i1 = _g1++;
				pos = SpaceColonization.randomVec3(this.options.centerRadius);
				if(this.options.type == SCType._2D) pos.z = 0;
				this.buds.push({ state : 0, position : pos, parentPos : null});
			}
		}
	}
	,generateHormones: function() {
		var positions = this.options.hormonePositions;
		this.hormones = [];
		var length;
		if(positions != null && positions.length > 0) length = positions.length; else length = this.options.numHormones;
		if(positions != null && positions.length > 0) {
			var pos;
			var _g = 0;
			while(_g < length) {
				var i = _g++;
				var self = positions[i];
				pos = new hxmath_math_Vector3Default(self.x,self.y,self.z);
				this.hormones.push({ state : 0, position : pos});
			}
		} else {
			var i1 = 0;
			while(i1 < length) {
				var pos1 = SpaceColonization.randomVec3(this.options.centerRadius);
				if(this.options.type == SCType._2D) pos1.z = 0;
				this.hormones.push({ state : 0, position : pos1});
				i1++;
			}
		}
	}
	,findAttractors: function() {
		this.hormonesForBud = [];
		var _g1 = 0;
		var _g = this.buds.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.hormonesForBud.push([]);
		}
		var _g11 = 0;
		var _g2 = this.hormones.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			var hormone = this.hormones[i1];
			if(hormone.state != 0) continue;
			var minDistIndex = -1;
			var minDist = this.options.viewDistance;
			var _g3 = 0;
			var _g21 = this.buds.length;
			while(_g3 < _g21) {
				var j = _g3++;
				var bud = this.buds[j];
				if(bud.state > 0) continue;
				var dist;
				var b = bud.position;
				var self = hormone.position;
				var this1;
				var this2;
				var self3 = self;
				this2 = new hxmath_math_Vector3Default(self3.x,self3.y,self3.z);
				var self2 = this2;
				self2.x -= b.x;
				self2.y -= b.y;
				self2.z -= b.z;
				this1 = self2;
				var self1 = this1;
				dist = Math.sqrt(self1.x * self1.x + self1.y * self1.y + self1.z * self1.z);
				if(bud.direction != null) {
					var budPosDirNorm;
					var this3;
					var self5 = bud.direction;
					this3 = new hxmath_math_Vector3Default(self5.x,self5.y,self5.z);
					var self4 = this3;
					var length;
					var self6 = self4;
					length = Math.sqrt(self6.x * self6.x + self6.y * self6.y + self6.z * self6.z);
					if(length > 0.0) {
						var self7 = self4;
						self7.x /= length;
						self7.y /= length;
						self7.z /= length;
						self7;
					}
					budPosDirNorm = self4;
					var hormPosNorm;
					var this4;
					var b1 = bud.position;
					var this5;
					var self10 = hormone.position;
					this5 = new hxmath_math_Vector3Default(self10.x,self10.y,self10.z);
					var self9 = this5;
					self9.x -= b1.x;
					self9.y -= b1.y;
					self9.z -= b1.z;
					this4 = self9;
					var self8 = this4;
					var length1;
					var self11 = self8;
					length1 = Math.sqrt(self11.x * self11.x + self11.y * self11.y + self11.z * self11.z);
					if(length1 > 0.0) {
						var self12 = self8;
						self12.x /= length1;
						self12.y /= length1;
						self12.z /= length1;
						self12;
					}
					hormPosNorm = self8;
					var dot = budPosDirNorm.x * hormPosNorm.x + budPosDirNorm.y * hormPosNorm.y + budPosDirNorm.z * hormPosNorm.z;
					var angle = Math.acos(dot);
					if(angle > this.options.viewAngle * 2) continue;
				}
				if(dist < minDist) {
					minDist = dist;
					minDistIndex = j;
				}
			}
			if(minDistIndex == -1) continue;
			this.hormonesForBud[minDistIndex].push(i1);
			if(minDist < this.options.deadZone && minDistIndex != -1) hormone.state++;
		}
	}
	,calculateAverageVec: function(index) {
		var avgPosCount = 0;
		var avgPos = new hxmath_math_Vector3Default(0,0,0);
		var _g1 = 0;
		var _g = this.hormonesForBud[index].length;
		while(_g1 < _g) {
			var i = _g1++;
			var hormone = this.hormones[this.hormonesForBud[index][i]];
			var b = hormone.position;
			var this1;
			var self1 = avgPos;
			this1 = new hxmath_math_Vector3Default(self1.x,self1.y,self1.z);
			var self = this1;
			self.x += b.x;
			self.y += b.y;
			self.z += b.z;
			avgPos = self;
			avgPosCount++;
		}
		var s = 1 / avgPosCount;
		var this2;
		var self3 = avgPos;
		this2 = new hxmath_math_Vector3Default(self3.x,self3.y,self3.z);
		var self2 = this2;
		self2.x *= s;
		self2.y *= s;
		self2.z *= s;
		this.avgVec = self2;
	}
	,nextDirection: function(budPos,rotate) {
		var dir;
		var this1;
		var self1 = this.avgVec;
		this1 = new hxmath_math_Vector3Default(self1.x,self1.y,self1.z);
		var self = this1;
		self.x -= budPos.x;
		self.y -= budPos.y;
		self.z -= budPos.z;
		dir = self;
		var newLength = this.options.growthStep;
		var self2 = dir;
		var self3 = self2;
		var length;
		var self4 = self3;
		length = Math.sqrt(self4.x * self4.x + self4.y * self4.y + self4.z * self4.z);
		if(length > 0.0) {
			var self5 = self3;
			self5.x /= length;
			self5.y /= length;
			self5.z /= length;
			self5;
		}
		self3;
		var self6 = self2;
		self6.x *= newLength;
		self6.y *= newLength;
		self6.z *= newLength;
		self6;
		self2;
		if(rotate && this.options.growType == SCGrowType.SPLIT) {
			var a = this.options.branchAngle;
			var sin = Math.sin(a);
			var cos = Math.cos(a);
			dir.x = dir.x * cos + dir.y * sin;
			dir.y = -(dir.x * sin) + dir.y * cos;
		}
		return dir;
	}
	,nextDirectionForBranch: function(budPos) {
		var dir;
		var this1;
		var self1 = this.avgVec;
		this1 = new hxmath_math_Vector3Default(self1.x,self1.y,self1.z);
		var self = this1;
		self.x -= budPos.x;
		self.y -= budPos.y;
		self.z -= budPos.z;
		dir = self;
		var a = -this.options.branchAngle;
		var sin = Math.sin(a);
		var cos = Math.cos(a);
		var newLength = this.options.growthStep;
		var self2 = dir;
		var self3 = self2;
		var length;
		var self4 = self3;
		length = Math.sqrt(self4.x * self4.x + self4.y * self4.y + self4.z * self4.z);
		if(length > 0.0) {
			var self5 = self3;
			self5.x /= length;
			self5.y /= length;
			self5.z /= length;
			self5;
		}
		self3;
		var self6 = self2;
		self6.x *= newLength;
		self6.y *= newLength;
		self6.z *= newLength;
		self6;
		self2;
		dir.x = dir.x * cos + dir.y * sin;
		dir.y = -(dir.x * sin) + dir.y * cos;
		return dir;
	}
	,splitBranch: function(parentPos) {
		if(Math.random() > 1.0 - this.options.splitChance) {
			var branchNextDir = this.nextDirectionForBranch(parentPos);
			var branchNextPos;
			var this1;
			var self1 = parentPos;
			this1 = new hxmath_math_Vector3Default(self1.x,self1.y,self1.z);
			var self = this1;
			self.x += branchNextDir.x;
			self.y += branchNextDir.y;
			self.z += branchNextDir.z;
			branchNextPos = self;
			this.buds.push({ state : 0, position : branchNextPos, parentPos : parentPos, split : true});
			return true;
		}
		return false;
	}
	,iterate: function() {
		var _g2 = this;
		this.findAttractors();
		var _g1 = 0;
		var _g = this.buds.length;
		while(_g1 < _g) {
			var i = _g1++;
			var bud = this.buds[i];
			if(bud.state == 1) continue;
			if(this.hormonesForBud[i].length == 0) {
				if(bud.hormones != null) bud.hormones = [];
				bud.state++;
				continue;
			}
			var budPos;
			var self = bud.position;
			budPos = new hxmath_math_Vector3Default(self.x,self.y,self.z);
			this.calculateAverageVec(i);
			var didSplit = this.splitBranch(budPos);
			var nextDir = this.nextDirection(budPos,didSplit);
			var nextPos;
			var this1;
			var self2 = budPos;
			this1 = new hxmath_math_Vector3Default(self2.x,self2.y,self2.z);
			var self1 = this1;
			self1.x += nextDir.x;
			self1.y += nextDir.y;
			self1.z += nextDir.z;
			nextPos = self1;
			bud.state++;
			this.buds.push({ state : 0, position : nextPos, parentPos : bud.position});
			bud.hormones = this.hormonesForBud[i].map(function(i1) {
				return _g2.hormones[i1];
			});
		}
		return { buds : this.buds, hormones : this.hormones};
	}
};
var Std = function() { };
Std.__name__ = true;
Std["int"] = function(x) {
	return x | 0;
};
var hxmath_math_Vector3Default = function(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
};
hxmath_math_Vector3Default.__name__ = true;
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.__name__ = true;
Array.__name__ = true;
if(Array.prototype.map == null) Array.prototype.map = function(f) {
	var a = [];
	var _g1 = 0;
	var _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = f(this[i]);
	}
	return a;
};
SpaceColonization.DefaultOptions = { type : SCType._2D, deadZone : .1, growthStep : .02, splitChance : .4, numHormones : 800, startBuds : 1, centerRadius : 1, budPositions : null, hormonePositions : null, viewAngle : 0.873, branchAngle : 0.524, viewDistance : .3, growType : SCGrowType.SPLIT};
Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});
