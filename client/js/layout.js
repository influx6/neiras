function fieldset($p, text) {
	return $p
		.addClass('fieldset')
		.prepend($(document.createElement('span'))
			.addClass('legend')
			.text(text));
}