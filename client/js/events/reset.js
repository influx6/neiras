Trigger.singleWord.reset = function(msg) {
	Event.clear();
	Event.append( new resetEvent(endCode) );
};

function resetEvent(endCode) {
	this.endCode = endCode;
}

resetEvent.prototype.finish = function() {
	Log.add($(document.createElement('p')).addClass('info').text('Event pipe cleared'));
};
resetEvent.prototype.callback = function($p) {};