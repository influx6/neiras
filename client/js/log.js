var Log = {
	atBottom: true,
	charWidth: 80,
	parserActive: true,
	
	$iframe: null,
	$body: null,
	css: 'iframe',
	
	incompleteLine: '',
	
	init: function() {
		var css = Log.css;
		if( currentLayout )
			css += '_'+currentLayout;
		
		makeIframe( 'log', {
			css: css + '.css',
			designMode: false
		});
		
		Log.$iframe = $('#log');
		Log.$body = Log.$iframe.contents().find('body');
		
		if( DEBUG ) {
			Log.$iframe.after( $(document.createElement("div"))
				.attr('id', 'debug')
				.hide()
			);
			
			Log.$debug = $('#debug');
		}
			
		Log.calcWidth();
		
	},
	
	write: function(msg) {
		
		Log.setAtBottom();
		Log.$body.append(msg);
		
		// If the scroll was at bottom, we want to keep it that way
		Log.setScroll();
	},
	
	setAtBottom: function() {
		Log.atBottom = ((Log.$body.attr('scrollHeight') - Log.$body.scrollTop()) - Log.$iframe.outerHeight()) < 3;
	},
	
	setScroll: function() {
		if (Log.atBottom)
			Log.$body.attr({ scrollTop: Log.$body.attr('scrollHeight') });
	},
	
	add: function( $p ) {
		
		if ( $.trim($p.text()).length > Log.charWidth ) {
			$p.addClass('wrap');
			if( $p.text().match(/^Aquila rules/) )
				alert('['+$p.text()+']');
		}
		
		Log.write($p);
		
	},
	
	parseMessage: function(msg) {

		var lines;
		
		// Does it end with a new line then it is complete
		var incomplete = false;
		if (msg.substring(msg.length-2) == "\r\n") {
			msg = msg.substring(0, msg.length-1);
			lines = msg.split("\r\n");
		} 
		else
		{
			lines = msg.split("\r\n");
			incomplete = lines.pop();
		}
				
		$.each(lines, function(i, line) {
			
			var $p = $(document.createElement('p'))
				.text(Log.incompleteLine + line);
			
			Log.incompleteLine = '';
			
			// Sending the line to the event parser
			Event.parse($p);	
		});
		
		if ( incomplete != false )
			Log.incompleteLine = incomplete;
	},
	
	calcWidth: function() {
		
		var string = new Array(Log.charWidth + 1).join('M');
		var $log = $('#log');
		
		// We add a span with charWidth x M chars
		$log.after( $(document.createElement("span"))
			.text(string)
			.attr('id', 'width_calc')
			.css('font-family', $log.css('font-family'))
			.css('font-size', $log.css('font-size'))
			.hide() );
				
		var width = 
			$('#width_calc').width()
			+ Log.$iframe.width() - Log.$body.innerWidth() + 24;

		$('#width_calc').remove();
		
		
		
		$('#mainCol').width( width );
		// Then we remove the span
	}

};