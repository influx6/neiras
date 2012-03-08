var Trigger = {

	parse: function(msg) {	
	
		// We trim the text
		var trimmed = $.trim(msg);
		var ret;
		// 
		if (trimmed == "")
			return msg;
		
		var space_pos = trimmed.indexOf(' ');
		
		var first_word = space_pos == -1
			? trimmed.toLowerCase()
			: trimmed.substring(0, space_pos).toLowerCase();
		
		
		// Single word command
		if ( space_pos == -1 ) {
		
			// Exits
			if ( Data.room.exits ) {
			
				if ( Data.room.exits[first_word] ) {
					Event.append( new lookEvent() );
					return msg;
				}
			}
			
			// Other single word commands
			if ( Trigger.singleWord[first_word] ) {
				ret = Trigger.singleWord[first_word](msg);
				
				if (ret !== false)
					return ret;
			}
		}
		
		// Begins with commands
		if ( Trigger.beginsWith[first_word] ) {
			
			var ret = (Trigger.beginsWith[first_word])(msg);
			
			// False means that it actually wasn't a true match
			if ( ret !== false )
				return ret; 
		}
				
		// No alias match? Then we send the original message
		return msg;
	},
	
	singleWord: {
		quit:	function(msg) { return 'QUIT'; },
		exit:	function(msg) { return 'QUIT'; },
		logout:	function(msg) { return 'QUIT'; },
		look:	function(msg) {
			Event.append( new lookEvent() );
			return msg;
		},
		hide:	function(msg) {
			Log.$body.toggle(false);
			leftPanel.hide();
			rightPanel.hide();
		},
		show:	function(msg) {
			Log.$body.toggle(true);
			leftPanel.show();
			rightPanel.show();
		},
		home:	function(msg) {
			Event.append( new ignoreEvent(4) );
			Log.add( $(document.createElement('p')).addClass('info').text('You wake up back at home') );
			Event.append( new lookEvent() );
			
			return msg;		
		},
		
		ws:		function(msg) {
			rightPanel.setActive('inRoom');
			Event.append( new wsEvent() );
			return msg;
		},
		
		wf:		function(msg) {
			rightPanel.setActive('watchfor');
			Event.append( new wfEvent() );
			return msg;
		},
		
		reset:	function(msg) {
			Event.clear();
			Log.add($(document.createElement('p')).addClass('info').text('Clearing event pipe') );
			var endCode = Event.generateCode();
			Event.append( new resetEvent(endCode) );
			Socket.send('tp '+endCode);
		}
		
	},
	
	beginsWith: {
		connect: function(msg) {
			// Getting username and password
			var match = msg.match(/^connect\s+([^\s]*)\s+(.*)$/);
			
			// No match? Then no trigger will be done
			if( match == null )
				return false;
			
			Event.append( new connectEvent(match) );
			
			return msg;
		},
		
		tp: function(msg) {
			
			if ( msg.match(/^tp\s+#/) )
				return false;
			
			Event.append( new lookEvent('tport') );
			return msg;		
		},
		
		look: function(msg) {
			var match = msg.match(/^look\s+([^\s]+)$/);
			
			if (match == null)
				return false;
			
			if (Data.room.contents.indexOf(match[1].toLowerCase()) == -1 )
				return false;
			
			var startCode = Event.generateCode();
			var endCode = Event.generateCode();
			
			Socket.send('tp '+startCode+Socket.EOL+msg+Socket.EOL+'tp '+endCode);
			
			Event.append( new lookCharEvent(match[1], startCode, endCode, {log:true}) );
		},
		
		show: function(msg) {
			var match = msg.match(/^show\s+([^\s]+)$/);
			
			if (match == null) {
				Log.add($(document.createElement('p')).addClass('info').text('Syntax: show [name]'));
				return true;
			}
			
			var charid = $.trim(match[1].toLowerCase());
			if (!Data.chars[charid] ) {
				Log.add($(document.createElement('p')).addClass('info').text('Unable to find '+match[1]));
				return true;
			}
			
			Page.character.update(charid);
			leftPanel.setActive('character');
			return true;
		},
		
		wi: function(msg) {
			if (msg.match(/^[^\s]+\s+#/) )
				return false;
			
			Event.append( new wiEvent() );
			return msg;			
		},
				
		ws:	function(msg) {
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
		}
	}
};