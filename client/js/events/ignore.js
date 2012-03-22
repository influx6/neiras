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
			return eRet.Complete;
		
		return eRet.Partly;
	}
	
	return eRet.Pass;
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
			return eRet.Complete;
		
		return eRet.Partly;
	}
	
	return eRet.Pass;
};

// IDLE event
function idleEvent(count) {
	if ( typeof count != 'undefined' )
		this.count = count;
}

idleEvent.prototype.count = 1;
idleEvent.prototype.callback = function($p) {
	
	if ( this.count-- ) {
		
		Event.prepend(this);
		Event.prepend(new idleEvent());
		return eRet.Pass;
		
		if (this.count == 0)
			return eRet.Complete;
		
		return eRet.Partly;
	}
	
	return eRet.Pass;
};