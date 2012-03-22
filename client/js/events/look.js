// Triggers
Trigger.singleWord.home = function(msg) {
	Event.append( new ignoreEvent(4) );
	Log.add( $(document.createElement('p')).addClass('info').text('You wake up back at home') );
	Event.append( new lookEvent() );
	
	return msg;		
};

Trigger.singleWord.look = function(msg) {
	Event.append( new lookEvent(), msg);
};

Trigger.beginsWith.tp = function(msg) {
	if ( msg.match(/^tp\s+\#/) )
		return false;

	Event.append( new lookEvent('tport'), msg);
};


function lookEvent(state, options) {
	if (state) this.state = state;
	this.options = options || {};
	
	
	if( this.options.connect ) {
		this.finishCode = Event.generateCode();
		Socket.send('tp ' + this.finishCode);
	}
}

lookEvent.prototype.state = 'title';
lookEvent.prototype.ignore = [
	// 'You step out of the teleport booth.'
];

lookEvent.prototype.finish = function() {
	Page.room.update();
	leftPanel.setActive('room');
	
	Event.append( new wsEvent(), 'ws' );
	
};

lookEvent.prototype.callback = function($p) {
	
	var rerun;
	var match;
	var text = $p.text();
	
	do {
		rerun = false;
		
		switch(this.state) {
		case 'title':
			
			// Is it one of the Ignore-lines?
			if ( text.match(/^You /) ) {
				Log.add($p.addClass('info'));
				return eRet.Partly;
			}
			else if ( this.ignore.indexOf(text) != -1 ) {
				Log.add($p.addClass('info'));
				return eRet.Partly;
			}
			
			// We get a ws right after
			//Socket.send('ws');
			//Event.append( new wsEvent(), 'ws' );
			
			Data.room = {
				name: text,
				desc: [],
				exits: {},
				contents: []
			};
	
			Log.add( $p.addClass('room_name'));
			this.state = 'desc';
			return eRet.Partly;			
		
		case 'desc':			
			// Test if the description is complete and we have reached the Exits-list
			match = text.match(/^\[ Obvious Exits: (.*) \]$/m);
			if( match ) {
				rerun = 'exits';
				break;
			}
			
			if( text.match(/^Contents:$/) ) {
				rerun = 'contents_head';
				break;
			}
	
			// Adding the line to the room description
			if ( text.length > Log.charWidth ) {
				$p.addClass('wrap');
			}
			Data.room.desc.push($p[0]);
			
			return eRet.Partly;
			
		case 'exits':
			var exits = match[1].split(', ');
			
			// Matching the exits
			$.each(exits, function(i, exit) {
				var m;
				if( m = exit.match(/\(([^\)]+)\)/) ) {
					Data.room.exits[m[1].toLowerCase()] = exit;				
				}
				else if( m = exit.match(/\[([^\]]+)\]/) ) {
					Data.room.exits[m[1].toLowerCase()] = exit;
				}
				else if( m = exit.match(/<([^>]+)>/) ) {
					Data.room.exits[m[1].toLowerCase()] = exit;
				}
				else
					Data.room.exits[exit.toLowerCase()] = exit;
			});
			
			// If we have the exits, then we are done with the description.
			// Time to update the Room-page
			
			Log.add($p);
			this.state = 'contents_head';
			
			return eRet.Partly;
					
		case 'contents_head':
			if( text.match(/^Contents:$/) ) {
				this.state = 'contents';
				
				return eRet.Partly;
			}
			
			// No Contents head? We check if we have some post-contents (such as Sign-info and so)
			rerun = 'post_contents';
			break;
			
	
		case 'contents':
			
			
			// Server-messages are always last (I think).
			if( text.match(/^#/) || text.match(/ /) ) {
				rerun = 'post_contents';
				break;
			}
				
			var charid = $.trim(text).toLowerCase();
			
			if( !Data.chars[charid] )
				Data.chars[charid] = new Character(text);
			
			Data.room.contents.push(charid);
			
			Event.inactiveTimer(500, function() {
				Page.inRoom.update();				
			});
			
			return eRet.Partly;
			
		case 'post_contents':
			
			
			// Server-messages are always last (I think).
			if( text.match(/^#/) ) {
				Event.prepend(this);
				Page.inRoom.update();
				if( this.options.connect ) {
					Event.prepend( new wfEvent() );
				}
				Event.prepend( new serverMessageEvent() );
				return eRet.Pass;
			}
			
			// Adding the line to the room description
			if ( text.length > Log.charWidth ) {
				$p.addClass('wrap');
			}
			Data.room.desc.push($p[0]);
			
			return eRet.Partly;
		
		case 'tport':
			
			if( text.match(/^> "(.*)" is an unknown pattern\.$/m) ) {
				Log.add( $p.addClass('error') );
			}
			else {
				Log.add( $p.addClass('info') );
				this.state = 'title';
				return eRet.Partly;
			}
		
		}
	
		if (rerun != false) {
			this.state = rerun;
			rerun = true;
		}
		
	} while (rerun);
};