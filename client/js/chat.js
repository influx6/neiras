var Chat = {
	history: [],
	current: [],
	historyPos: 0,
	
	$iframe: null,
	$body: null,
	css: 'iframe',
	
	init: function() {
		var css = Chat.css;
		if( currentLayout )
			css += '_'+currentLayout;
		
		makeIframe( 'chat', {
			css: css+'.css',
			designMode: true}
		);
		
		
		Chat.$iframe = $('#chat');
		Chat.$body = Chat.$iframe.contents().find('body');
	},
	
	setText: function(text) {
		// Any changes in the text will deactivate the tabCompletion
		Complete.active = false;
		
		text = text || '';
		var length = text.length;

		Chat.$body.text(text);
	
		var win = Chat.$iframe[0].contentWindow;
		var body = win.document.body;
		body.focus();
		if (typeof win.getSelection != "undefined"
            && typeof win.document.createRange != "undefined") {
	        var range = win.document.createRange();
	        range.selectNodeContents(body);
	        range.collapse(false);
	        var sel = win.getSelection();
	        sel.removeAllRanges();
	        sel.addRange(range);
	    } else if (typeof win.document.body.createTextRange != "undefined") {
	        var textRange = win.document.body.createTextRange();
	        textRange.moveToElementText(body);
	        textRange.collapse(false);
	        textRange.select();
	    }		
	},

	sendText: function(only_store) {
		
		Chat.$body.find('br').replaceWith(' ');
		var text = Chat.$body.text();
		text = text.replace(/(\r\n|\n|\r)/gm, ' ');
		
		Chat.setText('');
		
		if (text == "") return;
		
		if( only_store ) {
			Action.storeHistory(text);			
		}
		else
		{

			if( Log.parserActive ) {
				// Passing the text to the action triggers
				text = Action.onSend(text);
				
				// Only passing on strings
				if (typeof text == 'string') {			
					try{
						Socket.send(text);
					} catch(exception){  
						Log.write('<p class="warning"></p>');  
					}
				}
				
			} else {
				Event.appended = false;
				var stored_text = text;
				// Passing the text to the action triggers
				text = Action.onSend(text);
				
				if( Event.appended )
					text = stored_text;
								
				// Only passing on strings
				if (typeof text == 'string') {			
					try{
						Socket.send(text);
					} catch(exception){  
						Log.write('<p class="warning"></p>');  
					}
				}

			}
		
		}
			
	}  
};

