function connectEvent(match) {
	this.match = match;
}

connectEvent.prototype.callback = function($p) {
	
	var text = $p.text();
	
	if( text.match(/^Huh\?/) ) {
		Data.connected = true;
		Data.me = this.match[1].toLowerCase();
		Log.add( $p.text('You are allready connected') );
		return;
	}
	else if( text.match(/^Either that player/) ) {
		Data.connected = false;
		Log.add($p);
		return;
	}
	
	
	Data.connected = true;
	var charid = this.match[1].toLowerCase();
	Data.chars[charid] = new Character(this.match[1]);
	Data.me = charid;
	Log.add($p);
	
	// Logging on, lookEvent with connect flag
	Event.prepend( new lookEvent('title', {connect:true}) );
	
	// And we directly look at ourselves
	var startCode = Event.generateCode();
	var endCode = Event.generateCode();
	Socket.send('tp '+startCode+Socket.EOL+'look '+this.match[1]+Socket.EOL+'tp '+endCode);
	Event.append( new lookCharEvent(this.match[1], startCode, endCode) );
};