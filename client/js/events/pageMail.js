
function pageMailEvent() {}

pageMailEvent.prototype.state = 'start';
pageMailEvent.prototype.callback = function($p) {
	
	var text = $p.text();
	
	switch(this.state) {
	case 'start':
		if( !text.match(/^You sense that you have (([1-9][0-9]+) page-mail messages|a page-mail message) waiting\.$/m) )
			return eRet.Pass;
		
		Log.add($p.addClass('info'));
		
		this.state = 'post';
		return eRet.Partly;
	
	case 'post':
		
		if( !text.match(/^You can read your/) )
			return eRet.Pass;
		
		Log.add($p.addClass('info'));
		return eRet.Complete;
	}

	return eRet.Pass;
};