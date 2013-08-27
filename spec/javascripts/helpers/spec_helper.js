beforeEach(function() {
	var dataName = "jagger";

	this.setElement = function(selector) {
		this.$el = $(selector);
	};

	this.getInstance = function() {
		return this.$el.data(dataName);
	};

	this.callJaggerWith = function(options) {
		// Remove the previous plugin if it exists
		if(this.getInstance()) {
			this.$el.jagger("remove");	
		}
		return this.$el.jagger(options);
	};

	this.callJaggerAndGetInstance = function(options) {
		this.callJaggerWith(options);
		return this.getInstance();
	};
});
