/**
	Define and instantiate your enyo.Application kind in this file.  Note,
	application rendering should be deferred until DOM is ready by wrapping
	it in a call to enyo.ready().
*/


enyo.kind({
	name: "app500.Application",
	kind: "enyo.Application",
	view: "app500.MainView"
});

//App Entry point. Enyo.ready gets called when DOMContentLoaded event fired.
enyo.ready(function () {
	new app500.Application({name: "app"});
});