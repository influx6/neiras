function idleEvent() {}

idleEvent.prototype.callback = function($p) {

	var m;
	var text = $p.text();

	// This is only if we are connected with a character
	if (Data.connected) {
		if ( m = text.match(/^<([^ ]+) just looked at you>$/m) ) {
			$p.html('&lt;<span class="name">' + m[1] + '</span> just looked at you&gt;').addClass('looked');
			Log.add($p);
			return true;
		}
		
		// System message
		if ( text.match(/^#/) ) {
			Event.prepend( new serverMessageEvent() );
			return false;			
		}
		
		// Check for rogue ws. We assume it is a far, just in case
		if ( text.match(/^Name____________/) ) {
			Event.clear();
			Event.append( new wsEvent({far: true}) );
		}
		
		if ( text.match(/^[0-9A-Za-z_']/) ) {
			// Finally we assume it is something produced by a character in the room
			Event.prepend( new poseEvent() );
			return false;
		}
	}
	
	Log.add($p);
};