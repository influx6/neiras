Trigger.beginsWith.whisper = function(msg) {
	var m = msg.match(/^(w|whisper)[^=]*=\s*(:?)/i);
	
	if (m == null)
		return false;
	
	var state = 'whisper';
	if(m[2] == ':')
		state += '_pose';
	
	Event.append(new poseEvent(state), msg);	
};
Trigger.beginsWith.w = Trigger.beginsWith.whisper;

Trigger.beginsWith.page = function(msg) {
	var m = msg.match(/^(p|page)[^=]*=\s*(:?)/i);
	
	if (m == null)
		return false;
	
	var state = 'page';
	if(m[2] == ':')
		state += '_pose';
	
	Event.append(new poseEvent(state), msg);	
};
Trigger.beginsWith.p = Trigger.beginsWith.page;

Trigger.firstChar[':'] = function(msg) {
	var m;
	if( !(m = msg.match(/^(.)./)) )
		return false;
	
	Event.append(new poseEvent(m[1]==':' ? 'default' : 'say'), msg);
};
Trigger.firstChar['"'] = Trigger.firstChar[':'];

function poseEvent(state) {
	this.state = state || 'default';
}

poseEvent.prototype.init = true;
poseEvent.prototype.finish = true;
poseEvent.prototype.addPose = function(mode, char, $p) {
	var cl = '';
	var legend = false;
	
	switch(mode) {
	case 'whisper':
		cl = ' whisper';
		legend = 'Whisper';
		break;
	case 'page':
		cl = ' page';
		legend = 'Page';
		break;
	default:			
	}
	
	$p
		.addClass('char_'+char+cl)
		.addClass('char');
		
	if( typeof Data.focus[char] != 'undefined' ) {
		var i = Data.focus[char];
		cl = 'focus';
	
		if( i >= 0 ) {
			cl += ' ' + _focusColors[i];
		}
		
		$p.addClass(cl);
	}
	
	if( typeof Data.ignore[char] != 'undefined' )
		$p.addClass('ignore');
	
	if( legend !== false ) {
		$p = fieldset($p, legend);
	}	

	Log.add($p);
};

poseEvent.prototype.callback = function($p) {

	var text = $.trim($p.text());
	var m = null;
	var mode = false;
	var pre = '';
	var mid = '';
	var post = '';
	
	switch(this.state) {
	case 'whisper':
		if( m = text.match(/^You whisper, "(.*)" to (.+?)\.$/) ) {
			mode = 'whisper';
			pre = ' whispers, "'+m[1]+'" to ';
			mid = m[2];
			post = '.';
		}
		break;
	case 'whisper_pose':
		if( m = text.match(/^You whisper, "([^\s,']+)(.*)" to (.+?)\.$/) ) {
			mode = 'whisper';
			pre = m[2] + ' (to ';
			mid = m[3];
			post = ')';
		}
		break;
	case 'page':
		if( m = text.match(/^You page, "(.*)" to (.+?)\.$/) ) {
			mode = 'page';
			pre = ' pages, "'+m[1]+'" to ';
			mid = m[2];
			post = '.';
		}
		break;
	case 'page_pose':
		if( m = text.match(/^You page-pose, "([^\s,']+)(.*)" to (.+?)$/) ) {
			mode = 'page';
			pre = m[2] + ' (to ';
			mid = m[3];
			post = ')';
		}
		break;
	case 'say':
		if( m = text.match(/^You say, "(.*)"$/) ) {
			mode = false;
			pre = ' says, "' + m[1] + '"';
			mid = false;
			post = '';
		}
		break;
	case 'default':
		if( m = text.match(/In a page-pose to you, ([^\s,']+)(.*)$/) ) {
			mode = 'page';
		}
		else if( m = text.match(/^([^ ]+) pages, "(.*)" to you.$/) ) {
			mode = 'page';
			mid = ' pages, "';
			post = '" to you.';
		}
		else if( m = text.match(/^([^ ]+) whispers, "(.*)" to you.$/) ) {
			
			mode = 'whisper';
			
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
			
			$p
				.text(pre)
				.append($span)
				.append( document.createTextNode(mid + m[2] + post) );
		
			this.addPose(mode, lc, $p);
		}
		else
			Log.add($p);
		
		return eRet.Complete;
		
	case 'idle':
		return eRet.Partly;
	}
	

	if( m === null ) {
		Event.prepend(new idleEvent());
		return eRet.Pass;
	}
	
	$me = $(document.createElement('span'))
		.text(Data.chars[Data.me].name)
		.addClass('name');
	

	$p
		.html($me)
		.append(document.createTextNode(pre));
	
	if( mid ) {
		$name = $(document.createElement('span'))
			.text(mid)
			.addClass('name');
		
		$p.append($name);
	}
		
	if( post )
		$p.append(document.createTextNode(post));
	
	this.addPose(mode, Data.me, $p);
		
	
	this.state = 'idle';
	return eRet.Partly;
};