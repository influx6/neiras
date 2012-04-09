
// Object that will store all session data
var Page = {};

function charPage(name, title, active) {
	
	this.title = title;
	this.name = name;
	this.active = active || false;
	this.current = null;
}

function createImage(img, width, height) {
	width = width || 100;
	height = height || 100;
	var $img = $(img.img);
	var ratio = width/height;
	var cx = img.cx;
	var cy = img.cy;
	var cw = img.cw;
	var ch = img.ch;
	var cr = cw/ch;
	if( cr > ratio ) { ch = cw/ratio; cy -= parseInt((ch-img.ch) / 2); }
	if( cr < ratio ) { cw = ratio*ch; cx -= parseInt((cw-img.cw) /2 ); }
	if( cx+cw > img.w ) cx = img.w-cx-cw;
	if( cy+ch > img.h ) cy = img.h-cy-ch;
	
	cr = width / cw; 
	
	$img
		.width(Math.round(img.w * cr))
		.height(Math.round(img.h * cr))
		.css('left', Math.round(-cx*cr) )
		.css('top', Math.round(-cy*cr) );
	
	var $div = $(document.createElement('a'))
		.addClass('crop')
		.css('width', width)
		.css('height', height)
		.attr('target', '_blank')
		.attr('href', img.url)
		.html($(document.createElement('div')).addClass('round'))
		.append($img);
	
	
	return $div;
}

Page.updateCharImage = function(char) {
	var $img = $('#charimage_'+char);
	var image = Data.chars[char].image;
	
	// If the image is not in display
	// or if the character doesn't have an image, lets leave
	if( !$img || !image ) return;
	
	var $newimg = createImage(image);
	$newimg.attr('id', 'charimage_'+char);
	$img.replaceWith($newimg);
};

charPage.prototype.update = function(charid) {
	
	if( charid ) {
		charid = $.trim(charid).toLowerCase();
		
		if( Data.chars[charid] )
			this.current = charid;
		else
			return;
	}
	
	if( !this.current )
		return;
	
	if( !Data.chars[this.current] )
		return;
	
	var char = Data.chars[this.current];
	
	var $tbody = $(document.createElement('tbody'));
		
	var $sex = $(document.createElement('td')).html('&nbsp;');
	if( char.sex )	$sex.text(char.sex);
		
	var $species = $(document.createElement('td')).html('&nbsp;');
	if( char.species )	$species.text(char.species);
	
	this.title = char.name;
	$('#panel_leftCol_tab_'+this.name).text(this.title);
		
	$tbody.append( $(document.createElement('tr'))
		.append( $(document.createElement('th')).text('Name') )
		.append( $(document.createElement('td')).text(char.name) )
	);
	
	$tbody.append( $(document.createElement('tr'))
		.append( $(document.createElement('th')).text('Sex') )
		.append($sex)
	);
	
	$tbody.append( $(document.createElement('tr'))
		.append( $(document.createElement('th')).text('Species') )
		.append($species)
	);
	
	var $image = null;
	if( char.image ) {
		$image = createImage(char.image);
	}
	
	this.$div.empty();
	
	if( $image )
		this.$div.append($image.attr('id', 'charimage_'+this.current));
	
	this.$div
		.append( $(document.createElement("table"))
			.attr('cellspacing', 0)
			.attr('cellpadding', 0)
			.addClass('def')
			.append($tbody)
		);
	
	if( char.desc ) {
		this.$div.append( $(document.createElement("h1") ).text('Description') );
	
		var that = this;
		$.each(char.desc, function(i, row) {
			var $p = $(document.createElement('p')).text(row);
			if( row.length > 39 )
				$p.addClass('wrap');
			that.$div.append($p);
		});
	}
	
	if( char.wixxx ) {
		this.$div
			.append( $(document.createElement("h1") ).text('Wixxx') )
			.append( $(document.createElement("p") ).text(char.wixxx.join(' ')) );
	}
};

Page.myself = new charPage('myself', 'Myself', true);

Page.character = new charPage('character', 'Noone', false);
	
Page.room = {
	title:'Room',
	
	update: function() {
		this.$div.empty()
			.append( $(document.createElement("h1")).text(Data.room.name) )
			.append( Data.room.desc );
		
	}
	
};

Page.watchfor = {
	title:'Watchfor',
	
	update: function() {
		
		if( !Data.watchfor ) 
			return;
		
		var $thead = $(document.createElement('thead')).append(
			$(document.createElement('tr'))
				.append( $(document.createElement('th')).text('Name') )
				.append( $(document.createElement('th')).html('Sex') )
				.append( $(document.createElement('th')).html('Species') )
		);
		
		var $tbody = $(document.createElement('tbody'));
		var even = false;
		
		$.each(Data.watchfor, function(i, k) {
		
			var char = Data.chars[k];
			
			var $sex = $(document.createElement('td')).html('&nbsp;');
			if( char.sex )	$sex.text(char.sex);
			
			var $species = $(document.createElement('td')).html('&nbsp;');
			if( char.species )	$species.text(char.species);
			
			var $tr = $(document.createElement('tr'))
				.append( $(document.createElement('td')).text(char.name) )
				.append( $(document.createElement('td')).html($sex) )
				.append( $(document.createElement('td')).html($species) );
			
			if( char.idle == 'sleep' ) {
				$tr.addClass('sleeping');
			} else if( char.idle >= 30) {
				$tr.addClass('idle30');
			} else if( char.idle >= 10) {
				$tr.addClass('idle10');
			} else {
				$tr.addClass('idle0');
			}
			
			if( even ) $tr.addClass('even');
			else $tr.addClass('odd');
			even = !even;
			
			$tbody.append($tr);			
		});
	
		var $table = $(document.createElement('table'))
			.attr('cellspacing', 0)
			.attr('cellpadding', 0)
			.addClass('contents')
			.append($thead)
			.append($tbody);
		
		this.$div.empty().html($table);
	}
};

Page.inRoom = {
	title:'In room',
	
	update: function() {
			
		var $thead = $(document.createElement('thead')).append(
			$(document.createElement('tr'))
				.append( $(document.createElement('th')).text('Name') )
				.append( $(document.createElement('th')).html('Sex') )
				.append( $(document.createElement('th')).html('Species') )
		);
		
		var $tbody = $(document.createElement('tbody'));
		var even = false;
		
		$.each(Data.room.contents, function(i, k) {
		
			var char = Data.chars[k];
			var $sex = $(document.createElement('td')).html('&nbsp;');
			if( char.sex )	$sex.text(char.sex);
			
			var $species = $(document.createElement('td')).html('&nbsp;');
			if( char.species )	$species.text(char.species);
			
			var $tr = $(document.createElement('tr'))
				.append( $(document.createElement('td')).text(char.name) )
				.append( $sex )
				.append( $species );
			
			if( char.idle == 'sleep' ) {
				$tr.addClass('sleeping');
			} else if( char.idle >= 30) {
				$tr.addClass('idle30');
			} else if( char.idle >= 10) {
				$tr.addClass('idle10');
			} else {
				$tr.addClass('idle0');
			}
			
			if( even ) $tr.addClass('even');
			else $tr.addClass('odd');
			even = !even;
			
			$tbody.append($tr);			
		});

		var $table = $(document.createElement('table'))
			.attr('cellspacing', 0)
			.attr('cellpadding', 0)
			.addClass('contents')
			.append($thead)
			.append($tbody);
		
		this.$div.empty().html($table);
	}
};