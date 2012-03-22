// The return values for the events
var eRet = {
	Complete: null,	// The line is handled and the Event is completed
	Pass: false,	// The line is not handled and will be passed on to the next event.
	Partly: true,	// The line is handled but the Event is not completed
	Idle: 2			// The line is not handled but will be passed on to the Idle event. The current Event is not removed.
};

var Event = {
	queue: [],
	codeCount: 0,
	
	inactive: false,
	timer: null,
	inactiveCallback: null,
	codePrefix: '_NTJS_',
	
	debug_last_event: null,
	debug_odd: true,
	
	// Adding new event to top of stack
	append: function (event, msg) {
		Event.queue.push(event);
		
		if( msg ) {
			if( typeof msg != 'string' )
				msg = '';
			
			// If init is defined, we send an event code before the msg
			if( typeof event.init != 'undefined' ) {
				event.initCode = Event.generateCode();
				msg = 'tp ' + event.initCode + (msg==''?'':Socket.EOL+msg);
			}
			
			if( typeof event.finish != 'undefined' ) {
				event.finishCode = Event.generateCode();
				msg = (msg==''?'':msg+Socket.EOL) + 'tp ' + event.finishCode;
			}
			
			Socket.send(msg);
		}		
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
		return this.codePrefix + this.codeCount;
	},
	
	clear: function() {
		// Removing any old timer
		if( Event.timer )
			clearTimeout(Event.timer);
	
		this.inactive = false;
		this.queue = [];
	},
	
	isCode: function(text, code) {
		if( code ) {
			var str = '> "_NTJS_' + code + '" is an unknown pattern.';
			return (text.indexOf(str) == 0);
		}
		
		var m;
		if( m = text.match(/> "(.*)" is an unknown pattern\./)  ) {
			if( m[1].indexOf( this.codePrefix ) == 0 )
				return m[1];
		}
		
		return false;
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
		var code;
		var text = $p.text();
		
		if( DEBUG ) {
			var $debug;
			var debug_title = '';
			var debug_state;
			$debug = $(document.createElement("p")).text(text);
			
		}
		
		Event.inactive = false;
		
		// Is it an eventCode?
		if( code = Event.isCode(text) ) {
			
			var delCount = 0;
			Event.last_debug_event = null;
			
			$.each(Event.queue, function(k, e) {
				var iC = typeof e.initCode == 'undefined' ? null : e.initCode;
				var fC = typeof e.finishCode == 'undefined' ? null : e.finishCode;
				
				if( iC !== null ) {
					if( iC == code ) {
						if( typeof e.init == 'function' )
							e.init();
						// Deleting the initCode means it is initiated
						delete(e.initCode);
						
						if( DEBUG ) {
							Event.debug_odd = !Event.debug_odd;
							Event.debug_last_event = e.constructor.name;
							$debug.addClass('info').addClass(Event.debug_odd ? 'odd' : 'even').text('Init ' + e.constructor.name);
							Log.$debug.append($debug); 
						}
						return false;
					}
				
					// Getting a code that doesn't match the next events initCode means we are out of sync.
					// We there for delete the event.
					delCount++;
					if( DEBUG ) {
						Event.debug_odd = !Event.debug_odd;
						$debug.addClass('info').addClass(Event.debug_odd ? 'odd' : 'even').text((fC == code ? 'Finish before Init: Delete ' : 'Init mismatch: Delete ') + e.constructor.name);
						Log.$debug.append($debug); 
					}
					
					// If it was the events finishCode we don't continue the loop 
					return fC != code;
				}
				
				// Does the next event have a finishCode?
				if( fC !== null ) {
					
					// Does the finishCode match?
					if( fC == code ) {
						if( typeof e.finish == 'function' )
							e.finish();
						delCount++;
						
						if( DEBUG ) {
							$debug.addClass('info').addClass(Event.debug_odd ? 'odd' : 'even').text('Finish ' + e.constructor.name);
							Log.$debug.append($debug); 
						}
						return false;
					}
					
					if( DEBUG ) {
						Event.debug_odd = !Event.debug_odd;
						$debug.addClass('info').addClass(Event.debug_odd ? 'odd' : 'even').text('Finish mismatch: Delete ' + e.constructor.name);
						Log.$debug.append($debug); 
					}
				}
				else {
					if( DEBUG ) {
						Event.debug_odd = !Event.debug_odd;
						$debug.addClass('info').addClass(Event.debug_odd ? 'odd' : 'even').text('Delete ' + e.constructor.name);
						Log.$debug.append($debug); 
					}
				}
				
				delCount++;
			});
			
			// Are we to delete any events?
			if( delCount > 0 ) {
				Event.queue.splice(0, delCount);
			}
			
		}
		else
		{	
			var event;
			do {
				
				if( Event.queue.length ==  0 )
					Event.prepend(new idleEvent());
			
				event = Event.queue.shift();
				
				if( DEBUG ) {
					debug_state = typeof event.state == 'undefined' ? false : event.state;
				}
				ret = event.callback($p);
	
				if( ret === eRet.Idle ) {
					Event.queue.unshift(event);
					Event.prepend(new idleEvent());					
				}
				else if( ret === eRet.Partly ) {
					Event.queue.unshift(event);
				}
				
				if( DEBUG && (ret === eRet.Pass || ret === eRet.Idle )) {
					debug_title += event.constructor.name + (ret === eRet.Pass ? ' Pass > ' : ' Idle > ');
				}
				
			} while( ret === eRet.Pass || ret === eRet.Idle ); // line is not processed and should be handled by the next event in queue
		
			if( DEBUG ) {
				
				if( Event.debug_last_event !== event.constructor.name ) {
					Event.debug_odd = !Event.debug_odd;
					Event.debug_last_event = event.constructor.name;
				}	
				
				if( ret === eRet.Complete ) {
					debug_title += event.constructor.name + ' Complete';
					if( debug_state )
						Event.debug_last_event = null;
					
				} else {
					debug_title += event.constructor.name + (debug_state ? ' State:' + debug_state + (debug_state == event.state ? '' : ' > ' + event.state) : ' Partly');					
				}
				
				if ( $debug.text().length > Log.charWidth ) {
					$debug.addClass('wrap');
				}
				
				
				Log.$debug.append($debug.addClass(Event.debug_odd ? 'odd' : 'even').attr('title', debug_title));				
			}
			
		}	
	}
	
};