function serverMessageEvent() {}

serverMessageEvent.prototype.callback = function($p) {

	var text = $p.text();
	if( text.match(/^#/) ) {
		$p.addClass('server_message');
		Log.add($p);

		Event.inactiveTimer(200);
		return eRet.Partly;
	}
	
	return eRet.Pass;
			
};