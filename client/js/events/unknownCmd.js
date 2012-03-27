function unknownCmdEvent() {}

unknownCmdEvent.prototype.init = true;
unknownCmdEvent.prototype.finish = true;
unknownCmdEvent.prototype.callback = function($p) {

	var text = $p.text();

	// This is only if we are connected with a character
	if (Data.connected) {
		
		if ( text == 'Huh?  (Type "help" for help.)' ) {
			Log.add($p.addClass('info'));
		}
	}
	
	Log.add($p);
	return eRet.Partly;
};