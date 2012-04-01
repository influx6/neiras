
Trigger.beginsWith.notify = function(msg) {
	var m;
	if( m = msg.match(/^notify\s+([^\s]+)$/i) ) {
	
		var lc = m[1].toLowerCase();
		
		if( typeof Data.notify[lc] == 'undefined' )
			Log.add($(document.createElement('p')).addClass('info').text('Added ' + m[1] + ' to sound notification'));

		
		Data.notify[lc] = new Audio("js/notify2.ogg");

	}
	
	return true;
};

Trigger.beginsWith.unnotify = function(msg) {
	var m;
	if( m = msg.match(/^unnotify\s+([^\s]+)$/) ) {
	
		var lc = m[1].toLowerCase();
			
		if( typeof Data.notify[lc] != 'undefined' ) {
			delete Data.notify[lc];
			
			Log.add($(document.createElement('p')).addClass('info').text('Removed ' + m[1] + ' from sound notification'));	
		
		}
	}
	else {
		Log.add($(document.createElement('p')).addClass('info').text(m[1] + ' not found in notification list'));
	}
	
	return true;
};