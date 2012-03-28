var Chat = {
	history: [],
	current: [],
	historyPos: 0,
	
	$iframe: null,
	$body: null,
	
	init: function() {	
		makeIframe( 'chat', {
			css: 'iframe.css',
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
		
		var text = Chat.$body.text();
		Chat.setText('');
		
		if (text == "") return;
		
		if( only_store ) {
			Action.storeHistory(text);			
		}
		else
		{			
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
		}
			
	}  
};

