var DEBUG = true;

$.ctrl = function(key_code, callback, args) {
    $(document).keydown(function(e) {
        if(!args) args=[]; // IE barks when args is null
        if(e.keyCode == key_code && e.ctrlKey) {
            callback.apply(this, args);
            return false;
        }
    });
};


Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j, 1);
        }
    }
    return a;
};

function preventDefault(event) {
	if (event.preventDefault) {
		event.preventDefault();
	} else if (typeof event.returnValue !== "undefined") {
		event.returnValue = false;
    }
}

function makeIframe( id, opt ) {
	if( !opt ) opt = {};
	
	element = $('#'+id);
	if( !element )
			return;
	
	var iframe = document.createElement("iframe");
    iframe.frameBorder = 0;
    iframe.frameMargin = 0;
    iframe.framePadding = 0;
    iframe.height = element.height;
    iframe.id = id;
    iframe.title = id;
    element.after(iframe).remove();
    var css = opt.css
    	? "<link type='text/css' rel='stylesheet' href='css/"+opt.css+"' />"
    	: "";
    var doc = "<html><head>"+css+"</head><body></body></html>";
    
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(doc);
    iframe.contentWindow.document.close();
    
    if( opt.designMode ) {
    	enableDesignMode(iframe);
	    
	    var fwin = iframe.contentWindow || iframe.contentDocument;
	    if (fwin.document.attachEvent) {
	    	fwin.document.attachEvent('onkeypress', keypressHandler);
	    	fwin.document.attachEvent('onkeydown', keydownHandler);
	    	fwin.document.attachEvent('onmouseup', mouseupHandler);
	    }
	    else if (fwin.document.addEventListener) {
	    	fwin.document.addEventListener('keypress', keypressHandler, false);
	    	fwin.document.addEventListener('keydown', keydownHandler, false);
	    	fwin.document.addEventListener('mouseup', mouseupHandler, false);
	    }
    }
    
    return iframe;     
} // makeIframe
 
function enableDesignMode(iframe) {
     
	if (document.contentEditable) {
        iframe.contentWindow.document.designMode = "On";
        callback();
        return true;
    }
    else if (document.designMode != null) {
        
    	iframe.contentWindow.document.designMode = "on";
        return true;
        
    }
    return false;
}

function keypressHandler(e) {
	// Deactivating tab completion
	//if( e.keyCode != 9 ) // Tab
	//	Complete.active = false;
	
	if (e.keyCode == '13') {
		Chat.sendText();
		//$('#chat').contents().find('body:first').focus();
		preventDefault(e);
		return false;
	} //else if( e.keyCode == 9) { // Tab
	//	Action.onComplete();
    //	preventDefault(e);
    //	return false;
    //}
}

function keydownHandler(e) {
	var keyCode;
	if(window.event) { // IE
		keyCode = e.keyCode;
	} else if(e.which) { // Netscape/Firefox/Opera
		keyCode = e.which;
	} else {
		keyCode = e.keyCode;
	}
	
	// Deactivating tab completion
	if( keyCode != 9 ) // Tab
		Complete.active = false;
	else {
		Action.onComplete();
	    preventDefault(e);
	    return false;
	}
	
	if (keyCode == 38 && e.ctrlKey) { // CTRL+Up
        Action.onPrevious();
        preventDefault(e);
        return false;
    } else if (keyCode == 40 && e.ctrlKey) { // CTRL+Down
        Action.onNext();
        preventDefault(e);
        return false;
    }
}

function mouseupHandler(e) {
	Complete.active = false;
}

var leftPanel = null;
var rightPanel = null;

function initTapsJS(mServer, ioServer) {
	
	Loader.load( function() {
		Chat.init();
		Log.init();
		initPanels();
		
		
		Socket.connect(mServer, ioServer);
		
		$(document).keypress(keypressHandler);
	});
}