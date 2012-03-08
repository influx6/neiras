
var Event = {
	
	queue: [],
	codeCount: 0,
	
	inactive: false,
	timer: null,
	inactiveCallback: null,
	
	// Adding new event to top of stack
	append: function (event) {
		Event.queue.push(event);
	},
	
	// Adding new event to bottom of the stack
	prepend: function (event) {
		Event.queue.unshift(event);
	},

	// Replacing the current event at the bottom of stack
	modify: function(event) {
		Event.queue[0] = event;
	},
	
	generateCode: function() {
		this.codeCount++;
		return '_NTJS_' + this.codeCount;
	},
	
	clear: function() {
		// Removing any old timer
		if( Event.timer )
			clearTimeout(Event.timer);
	
		this.inactive = false;
		this.queue = [];
	},
	
	isCode: function(text, code) {
		
		var str = '> "' + code + '" is an unknown pattern.';
		
		
		return (text.indexOf(str) == 0);
	},
	
	// Removes the first event in line unless something happens within ms milliseconds
	inactiveTimer: function(ms, callback) {		
		Event.inactive = true;
		
		// Removing any old timer
		if( Event.timer )
			clearTimeout(Event.timer);
		
		Event.inactiveCallback = callback;
		Event.timer = setTimeout("Event.removeInactive()", ms);		
	},
	
	removeInactive: function() {
		if ( Event.inactive ) {
			if ( Event.queue.length > 0 ) {
				Event.queue.shift(); // Removing the event at the bottom
				if( typeof Event.inactiveCallback == 'function' )
					Event.inactiveCallback();
			}			
		}
		Event.timer = null;
	},
		
	parse: function($p) {
		var ret;
		
		Event.inactive = false;
		
		do {
			
			if( Event.queue.length > 0 ) {
		
				var event = Event.queue.shift();
				
				ret = event.callback($p);

				
				// If not false or null, we have finished this one
				if( ret != false && ret != null ) {
					Event.queue.unshift(event);
				}
			}
			else
			{
				event = new idleEvent();
				ret = event.callback( $p );
			}
			
		} while( ret == false ); // line is not processed and should be handled by the next event in queue
		
	}
	
};