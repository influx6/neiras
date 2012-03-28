function Character(name) { this.name = name; }


// Object that will store all session data
var Data = {
	room: {},
	chars: {},
	focus: [],
	ignore: []
};