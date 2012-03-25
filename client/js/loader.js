
Loader = {

	// path to the events-folder
	eventsPath: 'js/events/',
	
	// Any new event added to the 'events' folder should be added to this array
	events:	[
	    'ignore',
	    'idle',
	    'connect',
	    'look',
	    'ws',
	    'wf',
	    'wi',
	    'serverMessage',
	    'lookChar',
	    'pose',
	    'reset',
	    'focus',
	    'pageMail'
	],
	
	// Loads all the events listed in eventLoader.events
	// Executes callback once all events are loaded
	load: function(callback) {
	
		var path = this.eventsPath;
		var count = this.events.length;
		
		$.each( this.events, function(i, event){
			
			$.getScript(path + event + '.js', function() {
				count--;
				
				// Once all events has loaded, we call the callback
				if( count == 0 )
					callback();
			});
			
		});
		
	}
};