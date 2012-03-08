function lookCharEvent(char, startCode, endCode, options) {
	this.char = char;
	this.startCode = startCode;
	this.endCode = endCode;
	this.id = $.trim(char).toLowerCase();
	this.options = options || {};
}

lookCharEvent.prototype.state = 'code';
lookCharEvent.prototype.finish = function() {
	if( !this.id ) return;
	
	if( this.id == Data.me ) {
		Page.myself.update(Data.me);
		leftPanel.setActive('myself');
	}
	else {
		Page.character.update(this.id);
		leftPanel.setActive('character');
	}
};
lookCharEvent.prototype.callback = function($p) {
	
	var rerun;
	var match;
	var text = $p.text();
	
	do {
		rerun = false;
	
		switch(this.state) {
		case 'code':
			// lookChar is a persistent event, waiting for the startCode.
			if (!Event.isCode(text, this.startCode)) {
				Event.prepend(this);
				Event.prepend(new idleEvent());
				return false;
			}
			this.state = 'first';
			return true;
			
		case 'first':
			
			var str = "I don't see " + this.char + " here.";
			if( $.trim(text) == str ) {
				if( this.options.log ) Log.add($p.addClass('error'));
				this.state = 'fail';
				return true;
			}
			
			if( !Data.chars[this.id] )
				Data.chars[this.id] = new Character(this.char);
			
				
			Data.chars[this.id].desc = [];
			rerun = 'desc';
			break;

		case 'desc':
			
			if( text.match(/^Carrying:$/) ) {
				if( this.options.log ) Log.add($p);
				Data.chars[this.id].carries = [];
				this.state = 'carries';
				return true;
			}
			
			if( this.id == Data.me ) {
				if( match = text.match(/^<([^ ]+) just looked at you>$/) ) {
					if( match[1].toLowerCase() == Data.me ) {
						if( this.options.log ) {
							$p
								.html('&lt;You just looked at yourself&gt;')
								.addClass('looked');
							Log.add($p);
						}
						
						return true;							
					}
				}
			}
						
			if (Event.isCode(text, this.endCode)) {
				this.finish();
				return;
			}
			
			
			if( this.options.log ) Log.add($p);
			Data.chars[this.id].desc.push($p.text());	
			return true;
		
		case 'carries':
			if (Event.isCode(text, this.endCode)) {
				this.finish();
				return;
			}
			
			if( this.options.log ) Log.add($p);
			Data.chars[this.id].carries.push($p.text());	
			return true;
		
		case 'fail':
			if (Event.isCode(text, this.endCode)) {
				this.finish();
				return;
			}
			
			if( this.options.log ) Log.add($p.addClass('error'));	
			return true;
		}
			
		if (rerun != false) {
			this.state = rerun;
			rerun = true;
		}
		
	} while (rerun);
};