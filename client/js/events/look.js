// Triggers
Trigger.singleWord.home = function(msg) {
	Event.append( new ignoreEvent(4) );
	Log.add( $(document.createElement('p')).addClass('info').text('You wake up back at home') );
	Event.append( new lookEvent() );
	
	return msg;		
};

Trigger.beginsWith.tp = function(msg) {
	if ( msg.match(/^tp\s+\#/) )
		return false;

	Event.append( new lookEvent('tport') );
	return msg;		
};


function lookEvent(state, options) {
	if (state) this.state = state;
	this.options = options || {};
}

lookEvent.prototype.state = 'title';
lookEvent.prototype.ignore = [
	// 'You step out of the teleport booth.'
];

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
				return true;
			}
			else if ( this.ignore.indexOf(text) != -1 ) {
				Log.add($p.addClass('info'));
				return true;
			}
			
			// We get a ws right after
			Socket.send('ws');
			Event.append( new wsEvent() );
			
			Data.room = {
				name: text,
				desc: [],
				exits: {},
				contents: []
			};
	
			Log.add( $p.addClass('room_name'));
			this.state = 'desc';
			return true;			
		
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
	
			
			if( text.match(/^Name____________/) ) {
				Page.room.update();			
				return false;
			}
			
			// Adding the line to the room description
			if ( text.length > Log.charWidth ) {
				$p.addClass('wrap');
			}
			Data.room.desc.push($p[0]);
			
			return true;
			
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
			Page.room.update();
			leftPanel.setActive('room');
			
			Log.add($p);
			this.state = 'contents_head';
			
			Event.inactiveTimer(300);
			return true;
					
		case 'contents_head':
			if( text.match(/^Contents:$/) ) {
				this.state = 'contents';
				// If we retrieve an empty list, let's update the inRoom-page
				Event.inactiveTimer(500, function() {
					Page.inRoom.update();		
				});
				return true;
			}
			
			if( text.match(/^Name____________/) ) {
				Page.room.update();			
				return false;
			}
			
			// No Contents head? We check if we have some post-contents (such as Sign-info and so)
			rerun = 'post_contents';
			break;
			
	
		case 'contents':
			
			// Server-messages are always last (I think).
			if( text.match(/^#/) ) {
				Page.inRoom.update();
				if( this.options.connect ) {
					Event.prepend( new wfEvent() );
				}
				Event.prepend( new serverMessageEvent() );
				return false;
			}
			
			if( text.match(/^Name____________/) ) {
				Page.room.update();			
				return false;
			}
			// If a single space exists, it is not a name. We return false
			if( text.match(/ /) ) {
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
			
			return true;
			
		case 'post_contents':
			
			if( text.match(/^Name____________/) ) {
				Page.room.update();			
				return false;
			}
			
			// Server-messages are always last (I think).
			if( text.match(/^#/) ) {
				Page.inRoom.update();
				if( this.options.connect ) {
					Event.prepend( new wfEvent() );
				}
				Event.prepend( new serverMessageEvent() );
				return false;
			}
			
			Event.inactiveTimer(500);
			
				
			
			// Adding the line to the room description
			if ( text.length > Log.charWidth ) {
				$p.addClass('wrap');
			}
			Data.room.desc.push($p[0]);
			
			return true;
		
		case 'tport':
			
			if( text.match(/^> "(.*)" is an unknown pattern\.$/m) ) {
				Log.add( $p.addClass('error') );
			}
			else {
				Log.add( $p.addClass('info') );
				this.state = 'title';
				return true;
			}
		
		}
	
		if (rerun != false) {
			this.state = rerun;
			rerun = true;
		}
		
	} while (rerun);
};