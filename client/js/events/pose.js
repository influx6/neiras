function poseEvent() {}

poseEvent.prototype.callback = function($p) {

	var text = $.trim($p.text());
	var m;
	if( m = text.match(/^([^ ]+)/) ) {
		Socket.send('ws ' + m[1]);
		Event.append( new wsEvent({single:true}) );		
	}
	
	Log.add($p);
};