function poseEvent() {}

poseEvent.prototype.callback = function($p) {

	var text = $.trim($p.text());
	var m;
	var mode = false;
	var pre = '';
	var mid = '';
	var post = '';
	
	if( m = text.match(/In a page-pose to you, ([^ ,']+)(.*)$/) ) {
		mode = ' page';
		pre = '(Page) ';
	}
	else if( m = text.match(/^([^ ]+) pages, "(.*)" to you.$/) ) {
		mode = ' page';
		mid = ' pages, "';
		post = '" to you.';
	}
	else if( m = text.match(/^([^ ]+) whispers, "(.*)" to you.$/) ) {
		
		mode = ' whisper';
		
		if( m[2].substr(0, m[1].length) == m[1] && m[2].substr(m[1].length,1).match(/[ ',]/) ) {
			pre = '(Whisper) ';
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
		Socket.send('ws ' + m[1]);
		Event.append( new wsEvent({single:true}) );
	}
	
	if( mode != false ) {
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
		
		$p
			.text(pre)
			.append($span)
			.append( mid+m[2]+post )
			.addClass('char_'+lc+mode);	
				
	}
	
	Log.add($p);
};