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
					Event.append( new lookEvent(), msg );
					return;
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
		quit:	function(msg) { Data.connected=false; return 'QUIT'; },
		exit:	function(msg) { Data.connected=false; return 'QUIT'; },
		logout:	function(msg) { Data.connected=false; return 'QUIT'; },
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
		debug:	function(msg) {
			if( DEBUG ) {
				Log.$iframe.toggle();
				Log.$debug.toggle();
			}
		},
		
	},
	
	beginsWith: {

	}
};