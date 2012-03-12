var _focusColors = ['red','green','blue'];

Trigger.beginsWith.focus = function(msg) {
	var m;
	if( m = msg.match(/^focus\s+([^\s]+)(\s+[^\s]+)?$/i) ) {
	
		var lc = m[1].toLowerCase();
		
		var cl = 'focus';
		var col = $.trim(m[2]).toLowerCase();
		var rm = _focusColors.slice();
		
		var i = _focusColors.indexOf(col);
		if( i >= 0 ) {
			cl += ' ' + col;
			rm.splice(i, 1);
		}
		
		
		var elc = $(document.createElement('div')).text(lc).html();
		Log.$body.find('.char_'+elc).addClass(cl).removeClass(rm.join(' '));
	
		if( typeof Data.focus[lc] == 'undefined' )
			Log.add($(document.createElement('p')).addClass('info').text('Added ' + m[1] + ' to focus'));

		Data.focus[lc] = i;

	}
	
	return true;
};

Trigger.beginsWith.unfocus = function(msg) {
	var m;
	if( m = msg.match(/^unfocus\s+([^\s]+)$/) ) {
	
		var lc = m[1].toLowerCase();
			
		if( typeof Data.focus[lc] != 'undefined' ) {
			var elc = $(document.createElement('div')).text(lc).html();
			Log.$body.find('.char_'+elc).removeClass('focus ' + _focusColors.join(' '));
			
			delete Data.focus[lc];
			
			Log.add($(document.createElement('p')).addClass('info').text('Removed ' + m[1] + ' from focus'));	
		}
	}
	else {
		Log.add($(document.createElement('p')).addClass('info').text(m[1] + ' not found in focus'));
	}
	
	return true;
};