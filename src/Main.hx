package;
import js.Browser;

/**
 * ...
 * @author Mike Almond | https://github.com/mikedotalmond
 */
class Main {

	static function main() new Main();
	
	public function new() {
		
		var s = Browser.document.location.search;
		
		switch(Browser.document.location.search){
			case '?3d': 
				new Main3D();
				setupPage('2d', 'white');
			
			case '?2d': 
				new Main2D();
				setupPage('3d');
			
			default: Browser.document.location.search = '?2d';
		}
	}
	
	
	function setupPage(type:String, ?className:String = null){
		
		var  info = Browser.document.getElementsByClassName('info').item(0);
		var  footer = Browser.document.getElementsByClassName('footer').item(0);
		
		var a = Browser.document.createAnchorElement();
		a.href = '?$type';
		a.text = type;
		
		if (className != null) {
			info.classList.add(className);
			footer.classList.add(className);
		}
		
		info.appendChild(a);
	}
}