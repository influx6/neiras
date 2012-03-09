// Trigger
Trigger.singleWord.wf =	function(msg) {
	rightPanel.setActive('watchfor');
	Event.append( new wfEvent() );
	return msg;
};

function wfEvent() {}

wfEvent.prototype.state = 'headers';
wfEvent.prototype.callback = function($p) {
	
	var text = $p.text();
	
	switch(this.state) {
	case 'headers':
		if( text.match(/^No one that you are watching for is online.$/m) )
			return;
		
		if( !text.match(/^Players online for whom you are watching:/) )
			return false;
		
		Data.watchfor = [];
		this.state = 'chars';
		return true;
	
	case 'chars':
		
		if( text.match(/^Done./) ) {
			// We get a ws right after to get more info to the watchfor list
			if( Data.watchfor.length > 0 ) {
				Socket.send('ws #far ' + Data.watchfor.join(' '));
				Event.append( new wsEvent({far: true}) );
			}
			Page.watchfor.update();
			return;
		}
		
		var names = $.trim(text).split(/ +/);
		$.each(names, function(i, name) {
			var charid = name.toLowerCase();
			var char;
			
			if (Data.chars[charid])
				char = Data.chars[charid];
			else
				char = new Character(name);
			
			Data.chars[charid] = char;
			Data.watchfor.push(charid);
			
		});
		
		return true;
	}
	
};