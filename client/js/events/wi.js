function wiEvent(options) {
	this.options = options || {};
	this.charid = null;
}

wiEvent.prototype.state = 'headers';
wiEvent.prototype.callback = function($p) {
	
	var text = $p.text();
	Log.add($p);
	
	switch(this.state) {
	case 'headers':
		// wi is a persistent event.
		if( !text.match(/^-- WhatIsZ Extended/) ) {
			Event.prepend(this);
			Event.prepend(new idleEvent());
			return false;
		}
		 
		this.state = 'chars';
		return true;
	
	case 'chars':
		var match;
		var char;
		var i;
		
		if( this.charid != null)
			char = Data.chars[this.charid];
		
		if( text.match(/^-{56}/) ) {
			if( this.charid != null ) {
				char.wixxx.splice(char.wixxx.length-2, 2);
			}
			Page.character.update();
			return;
		}
		
		// Finding a new name
		if( !text.match(/^ {15}/)) {
			if( this.charid != null ) {
				char.wixxx.splice(char.wixxx.length-2, 2);
				this.charid = null;
			}
			
			if( text.match(/^.{15}\[Unable to match target player\]/) )
				return true;
			
			this.name = $.trim(text.substr(0, 14));
			this.charid = this.name.toLowerCase(); 
			
			if( this.charid.length == 14 ) {
				// [TODO] Do something about long names here
			}
			
			if (Data.chars[this.charid])
				char = Data.chars[this.charid];
			else
				char = new Character(name);
			
			char.wixxx = [];
		} else if( this.charid == null ) {
			return true;
		} else {
			char = Data.chars[this.charid];			
		}
			
		var list = $.trim(text.substr(15)).split(' ');
		
		$.each(list, function(i, trait) {
			char.wixxx.push(trait);
		});
		
		return true;
	}
	
};