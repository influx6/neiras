var Trigger = {

	parse: function(msg) {	
	
		// We trim the text
		var trimmed = $.trim(msg);
		var ret;
		// 
		if (trimmed == "")
			return msg;
		
		var first_char = trimmed.substring(0,1);
		
		// Check first char commands
		if ( Trigger.firstChar[first_char] ) {
			ret = Trigger.firstChar[first_char](msg);
			
			if (ret !== false)
				return ret;
		}
		
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
				
		// No alias match? Then we send an unknownCmdEvent
		Event.append( new unknownCmdEvent(), msg );
		return;
	},
	
	firstChar: {
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
		parse: function(msg) {
			Log.parserActive = !Log.parserActive;
			Log.add($(document.createElement('p')).addClass('info').text(
				Log.parserActive ? 'Parser reactivated' : 'Parser deactivated'
			));
		}
		
	},
	
	beginsWith: {
		parse: function(msg) {
			var m;
			if( m = msg.match(/^parse\s+(on|off)\s*$/i) ) {
				m = $.trim(m[1]).toLowerCase();
				
				if( m == 'on' && !Log.parserActive ) {
					Log.parserActive = true;
					Log.add($(document.createElement('p')).addClass('info').text('Parser reactivated'));
				}
				else if( m == 'off' && Log.parserActive ) {
					Log.parserActive = false;
					Log.add($(document.createElement('p')).addClass('info').text('Parser deactivated'));
				}
			}
			else
				Log.add($(document.createElement('p')).addClass('info').text('Usage: parse [on|off]'));
		}
	}
};