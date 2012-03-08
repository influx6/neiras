var Action = {};

Action.onSend = function( msg ) {
	
	Chat.history.push(msg);
	Chat.historyPos = Chat.history.length;
	
	msg = Trigger.parse(msg);
	
	return msg;
};


Action.getHistory = function() {
	var pos = Chat.historyPos;
	
	if( pos < 0 ) pos = 0;
	
	// At the bottom we have empty
	if( pos >= Chat.history.length ) {
		pos = Chat.history.length;
		Chat.setText('');
	}
	
	Chat.setText( Chat.history[pos] );
	
};

Action.onPrevious = function() {
	if( Chat.historyPos == 0 )
		return;
	
	Chat.historyPos--;
		
	Action.getHistory();
};

Action.onNext = function() {
	if( Chat.historyPos == Chat.history.length )
		return;
	
	Chat.historyPos++;
	
	Action.getHistory();
};

Action.onComplete = function() {
	
	var win = Chat.$iframe[0].contentWindow;
	var text = Chat.$body.text();
	var caretPos = 0;
	if (typeof win.getSelection != "undefined") {
		caretPos  = win.getSelection().getRangeAt(0).startOffset;
	}
	
	if( Complete.active ) {
		Complete.next();
	} else {
		var alist = [];
		if( Data.room.contents && Data.room.contents.length > 0)
			alist = alist.concat(Data.room.contents);
		
		
		if( Data.watchfor && Data.watchfor.length > 0 )
			alist = alist.concat(Data.watchfor);
		
		alist = alist.unique().sort();
		
		var list = {};

		$.each( alist, function(i, charid){
			charid = charid.toLowerCase();
			if( Data.chars[charid] )
				list[charid] = Data.chars[charid].name;
		});
		
		Complete.reset(text, caretPos, list);
	}
};

var Complete = {
	active: false,
	list: {},
	keys: [],
	text: null,
	before: null,
	after: null,
	prefix: null,
	keyPos: 0,
	caretPos: 0,
	fixedCaret: false
};

Complete.reset = function(text, caretPos, list) {
	var be = text.substr(0,caretPos);
	var af = text.substr(caretPos);
	Complete.caretPos = caretPos;
	var m;
	var piece;
	
	// Calculating the text before
	m = be.match(/([a-zA-Z0-9'-_\+\&]*)$/);
	piece = m[1];	
	Complete.before = be.substr(0, be.length-piece.length);
	Complete.prefix = piece.toLowerCase();
	
	// Calculating the text after
	m = af.match(/^([a-zA-Z0-9'-_\+\&]*)/);
	piece = m[1];
	Complete.fixedCaret = (piece.length > 0);
	if( !Complete.fixedCaret )
		Complete.caretPos -= Complete.prefix.length;
	
	Complete.after = af.substr(piece.length);
	Complete.prefix += piece.toLowerCase();
	
	Complete.keys = [];
	piece = Complete.prefix;
	var length = piece.length;
	$.each(list, function(key, val) {
		// Does the object start with 
		if( key.substr(0, length) != piece ) {
			
			delete(list[key]);
		} else {
			Complete.keys.push(key);
		}
	});
	
	// Did we find any matching keys?
	if ( Complete.keys.length <= 0 ) {
		return false;
	}
	
	// Okay, we have some objects in the list
	Complete.keys = Complete.keys.sort();
	Complete.keyPos = 0;
	Complete.list = list;
	
	Complete.active = true;
	Complete.setText();
};

Complete.next = function() {
	if( !Complete.active )
		return;
	
	Complete.keyPos++;
	if( Complete.keyPos >= Complete.keys.length )
		Complete.keyPos = 0;
	
	Complete.setText();
};

Complete.setText = function() {
	var word = Complete.list[Complete.keys[Complete.keyPos]];
	Chat.setText(Complete.before + word + Complete.after);
	
	// Settign the caretPos
	var caretPos = Complete.caretPos;
	if( !Complete.fixedCaretPos)
		caretPos += word.length;
	
	var win = Chat.$body[0];
	 if(win.createTextRange) {
		 alert('createTextRange: ' + caretPos);
         var range = win.createTextRange();
         win.move('character', caretPos);
         range.select();
     }
     else {
    	 if(win.selectionStart) {
    		 alert('selectionStart: ' + caretPos);
             win.focus();
             win.setSelectionRange(caretPos, caretPos);
         }
         else
             win.focus();
     }
	
	Complete.active = true;
};


