var currentLayout = null;

function fieldset($p, text) {
	return $p
		.addClass('fieldset')
		.prepend($(document.createElement('span'))
			.addClass('legend')
			.text(text));
}

function setLayout(name) {
	currentLayout = name;
	
	if( name )
		name = '_'+name+'.css';
	else
		name = '.css';
	
	$('link[rel=stylesheet]').attr({href : "css/style"+name});
	if( Chat.$iframe )
		Chat.$iframe.contents().find('link[rel=stylesheet]').attr({href : "css/" + Chat.css + name});
	
	if( Log.$iframe )
		Log.$iframe.contents().find('link[rel=stylesheet]').attr({href : "css/" + Log.css + name});
}


Trigger.beginsWith.layout = function(msg) {
	var m;
	if( m = msg.match(/^layout\s+([^\s]+)$/i) ) {
	
		var lc = m[1].toLowerCase();
		if( lc == 'default' || lc == 'white' )
			lc = null;
		
		setLayout(lc);

		Log.add($(document.createElement('p')).addClass('info').text('Set layout to ' + m[1]));
	}
	
	return true;
};