// Trigger
Trigger.singleWord.ws = function(msg) {
	rightPanel.setActive('inRoom');
	Event.append( new wsEvent() );
	return msg;
};

Trigger.beginsWith.ws = function(msg) {
	var m = msg.match(/^[^\s]+\s+(.*)$/);
	var p = m[1].split(/\s+/);
	
	if( p[0] == '#far' ) {
		Event.append( new wsEvent({far: true, log:true}) );
		return msg;
	}
	
	// Another #help command?
	if( p[0].match(/^#/) )
		return false;
	
	Event.append( new wsEvent({log:true}) );
	return msg;
};

function wsEvent(options) {
	this.options = options || {};
	this.myself = false;
}

wsEvent.prototype.state = 'headers';
wsEvent.prototype.callback = function($p) {
	
	var text = $p.text();
	
	switch(this.state) {
	case 'headers':
		// ws is a persistent event.
		if( !text.match(/^Name____________/) ) {
			Event.prepend(this);
			Event.prepend(new idleEvent());
			return eRet.Pass;
		}
		
		if( !this.options.far && (!this.options.single || !Data.room.contents) )
			Data.room.contents = [];
		 
		this.state = 'chars';
		if( this.options.log )
			Log.add($p);
		return eRet.Partly;
	
	case 'chars':
		var match;
		var i;
		
		if( text.match(/^-- Total:/) ) {
			if( this.options.far ) {
				Page.watchfor.update();
			} else {
				Page.inRoom.update();
				Page.myself.update(Data.me);
			}
			
			if( this.options.log )
				Log.add($p);
			return eRet.Complete;
		}
		
		if (this.options.single && !this.options.far) {

			// If we can't find the player, let's remove it from the room char list
			if( match = text.match(/^> Can't find player: (.*)$/m) ) {
		
				i = Data.room.contents.indexOf(match[1].toLowerCase());
				
				if( i >= 0 ) {
					Data.room.contents.splice(i, 1);
				}
				
				if( this.options.log )
					Log.add($p);
				return eRet.Partly;
			}
		}
		
		var name = $.trim(text.substr(0, 16));
		var charid = name.toLowerCase();
		var char;
		
		
		if (Data.chars[charid])
			char = Data.chars[charid];
		else
			char = new Character(name);
		
		var idle = $.trim(text.substr(17,4));
		
		if( idle == '' ) {
			idle = 0;
		} else if( match = idle.match(/^(\d+)m$/m) ) {
			idle = parseInt(match[1]);
		} else if( match = idle.match(/^(\d+)h$/m) ) {
			idle = 60 * parseInt(match[1]);
		} else {
			idle = 'sleep';
		}
		
		char.idle	= idle;
		char.sex	= $.trim(text.substr(22,9));
		char.species= $.trim(text.substr(32));
		
		Data.chars[charid] = char;

		if( !this.options.far ) {
			// Just checking if it exists already
			i = Data.room.contents.indexOf(charid);
			if (i < 0) {
				// If it is a new character entering the room, it is placed first
				if (this.options.single)
					Data.room.contents.unshift(charid);
				// Or else we put it last
				else
					Data.room.contents.push(charid);
			}
		}
		
		if( this.options.log )
			Log.add($p);
		return eRet.Partly;
	}
	
};