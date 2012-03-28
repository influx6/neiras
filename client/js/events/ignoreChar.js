
Trigger.beginsWith.ignore = function(msg) {
	var m;
	if( m = msg.match(/^ignore\s+([^\s]+)$/i) ) {
	
		var lc = m[1].toLowerCase();
		
		var elc = $(document.createElement('div')).text(lc).html();
		Log.setAtBottom();
		Log.$body.find('.char_'+elc).addClass('ignore');
		Log.setScroll();
		
		if( typeof Data.ignore[lc] == 'undefined' )
			setTimeout(function(){Log.add($(document.createElement('p')).addClass('info').text('Added ' + m[1] + ' to ignore list'));}, 100);
		
		Data.ignore[lc] = true;

	}
	
	return true;
};

Trigger.beginsWith.unignore = function(msg) {
	var m;
	if( m = msg.match(/^unignore\s+([^\s]+)$/) ) {
	
		var lc = m[1].toLowerCase();
			
		if( typeof Data.ignore[lc] != 'undefined' ) {
			
			Log.setAtBottom();
			var elc = $(document.createElement('div')).text(lc).html();
			Log.$body.find('.char_'+elc).removeClass('ignore');
			Log.setScroll();
				
			delete Data.ignore[lc];
			
			Log.add($(document.createElement('p')).addClass('info').text('Removed ' + m[1] + ' from ignore list'));	
		
		}
	}
	else {
		Log.add($(document.createElement('p')).addClass('info').text(m[1] + ' not found in ignore list'));
	}
	
	return true;
};