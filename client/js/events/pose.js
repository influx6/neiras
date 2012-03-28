function poseEvent() {}

poseEvent.prototype.callback = function($p) {

	var text = $.trim($p.text());
	var m;
	var mode = false;
	var pre = '';
	var mid = '';
	var post = '';
	var legend = false;
	
	if( m = text.match(/In a page-pose to you, ([^ ,']+)(.*)$/) ) {
		mode = ' page';
		legend = 'Page';
	}
	else if( m = text.match(/^([^ ]+) pages, "(.*)" to you.$/) ) {
		mode = ' page';
		mid = ' pages, "';
		post = '" to you.';
		legend = 'Page';
	}
	else if( m = text.match(/^([^ ]+) whispers, "(.*)" to you.$/) ) {
		
		mode = ' whisper';
		legend = "Whisper";
		
		if( m[2].substr(0, m[1].length) == m[1] && m[2].substr(m[1].length,1).match(/[ ',]/) ) {
			m[2] = m[2].substr(m[1].length);
			post = '';
		}
		else
		{
			mid = ' whispers, "';
			post = '" to you.';
		}
	}
	else if( m = text.match(/^([^ ,']+)(.*)$/) ) {
		mode = '';
		Event.append( new wsEvent({single:true}) , 'ws ' + m[1]);
	}
	
	if( mode !== false ) {
		var lc = m[1].toLowerCase();
				
		var $span = $(document.createElement('span'))
			.text(m[1])
			.addClass('name');
			
		if( typeof Data.focus[lc] != 'undefined' ) {
			var i = Data.focus[lc];
			var cl = 'focus';
		
			if( i >= 0 ) {
				cl += ' ' + _focusColors[i];
			}
			
			$p.addClass(cl);
		}
		
		if( typeof Data.ignore[lc] != 'undefined' )
			$p.addClass('ignore');
		
		$p
			.text(pre)
			.append($span)
			.append( mid + m[2] + post )
			.addClass('char_'+lc+mode)
			.addClass('char');
	
		if( legend !== false ) {
			$p = fieldset($p, legend);
		}
	}
	
	Log.add($p);
};