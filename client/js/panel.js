function Panel(id) {
	this.id = id;
	this.$div = $('#'+id);
	this.$content = this.$div.find('.c:first .panel:first');
	
	this.pages = [];
	this.current_page = null;
	
	this.tabs_hidden = true;
	this.redraw_required = true;
	this.$tabs_container = this.$div.find('div.tabs:first').hide();
	
	// Storing away a reference to itself
	this.$div.data('this', this);
}

Panel.prototype.hide = function() {
	this.$content.toggle(false);
};

Panel.prototype.show = function() {
	this.$content.toggle(true);
};

Panel.prototype.addPage = function (id, active) {
	
	
	var div_id = 'panelpage_'+this.id+'_'+id;
	
	// Should the page be active
	active = active || false;	
	if (this.pages.length <= 0)
		active = true;	
	
	var cont = this.$content;
	
	// Does the div for the page exists?
	if( cont.children('#'+div_id).length <= 0 ) {
		cont.append(
			$(document.createElement('div'))
				.attr('id', div_id)
				.toggle(Boolean(active))
		);
	}
	
	
	if( active )
		this.current_page = id;

	// Storing away the options for the page
	Page[id].id = div_id;
	Page[id].$div = $('#'+div_id);	
	
	this.pages.push(id);
	
	if (this.tabs_hidden)
		this.redraw_required = true;
	else
		this.redrawTabs();
		
	return this;
};

Panel.prototype.hideTabs = function() {
	this.$tabs_container.hide();
	return this;
};

Panel.prototype.showTabs = function() {
	if (!this.tabs_hidden)
		return this;
	
	if (this.redraw_required)
		this.redrawTabs();
	
	this.$tabs_container.show();
	return this;
};

Panel.prototype.redrawTabs = function() {
	
	// Check if we have any tabs. If not, hide the entire block.
	if (this.pages.length <= 0)
		this.hideTabs();
	
	var row = $( document.createElement('tr') );
    			
	var prev = 'n';
	var current;
	var that = this;
	
	$.each( this.pages, function (i, key) {
		var cl = '';
		if( key == that.current_page ) {
			current = 'f';					
		} else if( Page[key].disabled ) {					
			current = 'b';
		} else {
			cl = ' active';
			current = Page[key].hover ? 'a' : 'b';
		}
		
		var div = $( document.createElement('div') )
			.attr('id', 'panel_'+that.id+'_tab_' + key)
			.hover( that.mouseOver, that.mouseOut )
			.click( that.setActive )
			.text( Page[key].title );
					
		row
			.append( $( document.createElement('td') ).attr('class', prev + current) )
			.append( $( document.createElement('td') ).attr('class', current + cl).append( div ) );
		
		prev = current;
	});
	
	row.append( $( document.createElement('td') ).addClass(prev + 'n') );
			
	var table = $( document.createElement('table') )
		.attr('cellspacing', 0)
		.attr('cellpadding', 0)
		.attr('id', 'panel_'+this.id+'_tabstable')
		.append( row );
	
	this.$tabs_container
		.empty() // Might be needed to avoid memory leaks. I am not sure if .html does it.
		.html( table );
	this.redraw_required = false;
			
	return this;
};
	
Panel.prototype.updateTabs = function(that) {

	that = that || this;
	
	// Check if we have any tabs. If not, hide the entire block.
	if (that.pages.length <= 0)
		return that;
		
	var last = that.pages.length * 2;
	
	
	var prev = 'n';
	var current;
	var inbetween;
	
	$('#panel_'+that.id+'_tabstable td').each( function(i, element){
		// Check if it is an 'InBetween' part
		if( i % 2 == 0 ) {
			if( i == last ) {
				$(this).attr('class', prev + 'n');
				
			} else
				inbetween = this;
		} else {
			
			var key = $(this).children(':first').attr('id').substring( ('panel_'+that.id+'_tab_').length );
			
			// Finding out what type of tab we are on
			var cl = '';
			if( key == that.current_page ) {
				current = 'f';					
			} else if( Page[key].disabled ) {					
				current = 'b';
			} else {
				cl = ' active';
				current = Page[key].hover ? 'a' : 'b';
			}					
			
			$(this).attr('class',current + cl);
			$(inbetween).attr('class', prev + current);
			
			prev = current;
		}			
	});		
	
	return that;
};


Panel.prototype.mouseOver = function() {

	var parts = $(this).attr('id').split('_');
	var that = $('#'+parts[1]).data('this');
	
	var key = parts[3];

	Page[key].hover = true;
	
	// If it will have no effect, just exit
	if( key == that.current_page ||  Page[key].disable )
		return that;
	
	return that.updateTabs(that);		
};
	
Panel.prototype.mouseOut = function() {
	var parts = $(this).attr('id').split('_');
	var that = $('#'+parts[1]).data('this');
	
	var key = parts[3];

	Page[key].hover = false;
	
	// If it will have no effect, just exit
	if( key == that.current_page ||  Page[key].disable )
		return that;	
	
	return that.updateTabs(that);		
};
	
Panel.prototype.setActive = function(key) {
	
	var that = this;
	
	if( typeof key == 'object' ) {
		var parts = $(this).attr('id').split('_');
		that = $('#'+parts[1]).data('this');
		key = parts[3];
	}	
	
	// Check if same as current and if it does exist
	if( key == that.current_page || !Page[key] || Page[key].disable )
		return that;
	
	$('#panelpage_'+that.id+'_'+that.current_page).hide();
	$('#panelpage_'+that.id+'_'+key).show();
	that.current_page = key;
	
	return that.updateTabs();	
};

Panel.prototype.setWidth = function( charWidth ) {
	
	var string = new Array(charWidth + 1).join('M');
	
	// We add a span with charWidth x M chars
	this.$content.append( $(document.createElement("span"))
		.text(string)
		.attr('id', 'width_calc_'+this.id)
		.css('font-family', this.$div.css('font-family'))
		.css('font-size', this.$div.css('font-size'))
		.hide() );
			
	var width = 
		$('#width_calc_'+this.id).width() + 24;

		
	this.$div.width( width );
	// Then we remove the span
	$('#width_calc_'+this.id).remove();
	
	
	return this;
};

function initPanels() {

	leftPanel = new Panel('leftCol');
	rightPanel = new Panel('rightCol');
	
	leftPanel
		.setWidth(40)
		.addPage('myself', true)
		.addPage('character')
		.addPage('room')
		.showTabs();
	rightPanel
		.setWidth(40)
		.addPage('inRoom', true)
		.addPage('watchfor')
		.showTabs();
}
