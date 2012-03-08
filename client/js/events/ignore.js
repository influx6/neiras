// IGNORE event
function ignoreEvent(count) {
	if ( typeof count != 'undefined' )
		this.count = count;
}
ignoreEvent.prototype.count = 1;
ignoreEvent.prototype.callback = function($p) {
	
	if ( this.count-- ) {
		
		Log.add($p);
		if (this.count == 0)
			return;
		
		return true;
	}
	
	return false;
};



// DELETE event
function deleteEvent(count) {
	if ( typeof count != 'undefined' )
		this.count = count;
}
deleteEvent.prototype.count = 1;
deleteEvent.prototype.callback = function($p) {
	
	if ( this.count-- ) {
		
		if (this.count == 0)
			return;
		
		return true;
	}
	
	return false;
};

// IDLE event
function ignoreEvent(count) {
	if ( typeof count != 'undefined' )
		this.count = count;
}

ignoreEvent.prototype.count = 1;
ignoreEvent.prototype.callback = function($p) {
	
	if ( this.count-- ) {
		
		Event.prepend(this);
		Event.prepend(new idleEvent());
		return false;
		
		if (this.count == 0)
			return;
		
		return true;
	}
	
	return false;
};