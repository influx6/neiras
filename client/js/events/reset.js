// IGNORE event
function resetEvent(endCode) {
	this.endCode = endCode;
}
resetEvent.prototype.callback = function($p) {
		
	if (!Event.isCode($p.text(), this.endCode)) {
		Log.add($p);
		return true;
	}
	
	Log.add($(document.createElement('p')).addClass('info').text('Event pipe cleared'));	
	return;
};