$(function() {
	$.contextMenu({
		selector : '.window',
		items : {
			"edit" : {
				name : "Edit",
				icon : "edit",
				callback : function(key, options) {
                    editVirtualSensor(options.$trigger.get(0), true);
				}
			},
			"sep" : "---------",
			"delete" : {
				name : "Remove",
				icon : "delete",
				callback : function(key, options) {
			        deleteElement(options.$trigger.get(0), true);
			    }
			}
		}
	});

	$('.context-menu-one').on('click', function(e) {
		console.log('clicked', this);
	})
});