// Trigger
Trigger.singleWord.wf =	function(msg) {
	rightPanel.setActive('watchfor');
	Event.append( new wfEvent() );
	return msg;
};

Trigger.singleWord.watchfor = Trigger.singleWord.wf;

function wfEvent() {}

wfEvent.prototype.state = 'headers';
wfEvent.prototype.callback = function($p) {
	
	var text = $p.text();
	
	switch(this.state) {
	case 'headers':
		if( text.match(/^No one that you are watching for is online.$/m) )
			return eRet.Complete;
		
		if( !text.match(/^Players online for whom you are watching:/) )
			return eRet.Pass;
		
		Data.watchfor = [];
		this.state = 'chars';
		return eRet.Partly;
	
	case 'chars':
		
		if( text.match(/^Done./) ) {
			// We get a ws right after to get more info to the watchfor list
			if( Data.watchfor.length > 0 ) {
				Event.append( new wsEvent({far: true}), 'ws #far ' + Data.watchfor.join(' ') );
			}
			Page.watchfor.update();
			return eRet.Complete;
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
		
		return eRet.Partly;
	}
	
};