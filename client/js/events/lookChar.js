 var f_look = function(msg) {
	var match = msg.match(/^(look|l)\s+([^\s]+)$/);
	
	if (match == null)
		return false;
	
	//if (Data.room.contents.indexOf(match[2].toLowerCase()) == -1 )
	//	return false;
	
	Event.append( new lookCharEvent(match[2], {log:false}), msg );
};

Trigger.beginsWith.look = f_look;
Trigger.beginsWith.l = f_look;


// This trigger doesn't really belong in lookChar since it requires no parsing.
// But it at least utilizes the parsed information from previous looks
Trigger.beginsWith.show = function(msg) {
	var match = msg.match(/^show\s+([^\s]+)$/);
	
	if (match == null) {
		Log.add($(document.createElement('p')).addClass('info').text('Syntax: show [name]'));
		return true;
	}
	
	var charid = $.trim(match[1].toLowerCase());
	if (!Data.chars[charid] ) {
		Log.add($(document.createElement('p')).addClass('info').text('Unable to find '+match[1]));
		return true;
	}
	
	Page.character.update(charid);
	leftPanel.setActive('character');
	return true;
};

function lookCharEvent(char, options) {
	this.char = char;
	this.id = $.trim(char).toLowerCase();
	this.options = options || {};
}

lookCharEvent.prototype.state = 'first';
lookCharEvent.prototype.init = true;
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
		case 'first':
			
			var str = "I don't see " + this.char + " here.";
			if( $.trim(text) == str ) {
				if( this.options.log ) Log.add($p.addClass('error'));
				this.state = 'fail';
				return eRet.Partly;
			}
			
			if( !Data.chars[this.id] )
				Data.chars[this.id] = new Character(this.char);
			
			if( !this.options.log ) {			
				var html = this.id == Data.me
					? '&lt;You just looked at yourself&gt;'
					: '&lt;You just looked at <span class="name">' + this.char + '</span>&gt;';
				Log.add( $(document.createElement('p')).addClass('looked').html( html) );
			}
			
			Data.chars[this.id].desc = [];
			rerun = 'desc';
			break;

		case 'desc':
			
			if( text.match(/^Carrying:$/) ) {
				if( this.options.log ) Log.add($p);
				Data.chars[this.id].carries = [];
				this.state = 'carries';
				return eRet.Partly;
			}
			
			if( this.id == Data.me ) {
				if( match = text.match(/^<([^ ]+) just looked at you>$/) ) {
					if( match[1].toLowerCase() == Data.me ) {
						if( this.options.log ) {
							$p
								.text('<You just looked at yourself>')
								.addClass('looked');
							Log.add($p);
						}
						
						return eRet.Partly;
					}
				}
			}
			
			if( this.options.log ) Log.add($p);
			Data.chars[this.id].desc.push($p.text());	
			return eRet.Partly;
		
		case 'carries':
			
			if( this.options.log ) Log.add($p);
			Data.chars[this.id].carries.push($p.text());	
			return eRet.Partly;
		
		case 'fail':			
			if( this.options.log ) Log.add($p.addClass('error'));	
			return eRet.Partly;
		}
			
		if (rerun != false) {
			this.state = rerun;
			rerun = true;
		}
		
	} while (rerun);
};