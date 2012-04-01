function idleEvent() {}

idleEvent.prototype.callback = function($p) {

	var m;
	var text = $p.text();

	// This is only if we are connected with a character
	if (Data.connected) {
		if ( m = text.match(/^<([^ ]+) just looked at you>$/m) ) {
			var $span = $(document.createElement('span'))
				.text(m[1])
				.addClass('name');
			$p	.text('<')
				.append($span)
				.append(document.createTextNode(' just looked at you>'))
				.addClass('looked');
			Log.add($p);
			return eRet.Complete;
		}
		
		// System message
		if ( text.match(/^#/) ) {
			Event.prepend( new serverMessageEvent() );
			return eRet.Pass;			
		}
		
		// Check for rogue ws. We assume it is a far, just in case
		if ( text.match(/^Name____________/) ) {
			Event.append( new wsEvent({far: true}) );
			return eRet.Pass;
		}
		
		if ( text == 'Huh?  (Type "help" for help.)' ) {
			Log.add($p.addClass('info'));
		}
			
		
		if ( text.match(/^[0-9A-Za-z_']/) ) {
			// Finally we assume it is something produced by a character in the room
			Event.prepend( new poseEvent() );
			return eRet.Pass;
		}
	}
	
	Log.add($p);
	return eRet.Complete;
};