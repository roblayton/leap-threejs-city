require(['core/utils/FpsTracker', 'dom/primitives/Container', 'proj/ThreeController', 'proj/GestureController'], function(FpsTracker, Container, ThreeController, GestureController) {
	var Master = function() {

		var init = function() {
			// Fps
			var fps = new FpsTracker();

			var container = new Container({
				insert: {
					type: 'parent',
					target: document.body
				}
			});

            var gc = new GestureController();

			var tc = new ThreeController(container.el, {
				callbacks: {
					onRender: function() {
						fps.update();
					},
                    onGesture: function(gesture) {
                        gc.show(gesture);
                    }
				}
			});
		};

		init();

	}; // End
	var master = new Master();
});

