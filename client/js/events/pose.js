function poseEvent() {}

poseEvent.prototype.callback = function($p) {

	var text = $.trim($p.text());
	var m;
	if( m = text.match(/^([^ ]+)(.*)/) ) {
		
		var lc = m[1].toLowerCase();
				
		var $span = $(document.createElement('span'))
			.text(m[1])
			.addClass('name');
			
		
		if( Data.focus.indexOf(lc) != -1 )
			$p.addClass('focus');
		
		$p.html($span);
		$p.append( document.createTextNode(m[2]) );
		$p.addClass('char_'+lc);
		
		Socket.send('ws ' + m[1]);
		Event.append( new wsEvent({single:true}) );		
	}
	
	Log.add($p);
};