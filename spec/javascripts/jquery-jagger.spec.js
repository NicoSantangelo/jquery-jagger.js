describe("jquery tagger", function() {
	var jagger;

	beforeEach(function() {
		loadFixtures("jagger_fixture.html");
		this.setElement(".taggeable-container");

		spyOn(jQuery.fn, "jagger").andCallThrough();

		jagger = this.callJaggerWithAndGetInstance({
   			template: "#my-template"
   		});
	});

    it("should be a method of a jquery instance", function() {
        expect( jQuery().jagger ).toBeDefined();
    });

   	it("should set the instance in the data attribute", function() {
   		expect( this.$el.data("jagger") instanceof Jagger ).toBeTruthy();
	});

	it("should delegate the methods to the instance when a string is provided", function() {
        spyOn(jagger, "remove");
        this.$el.jagger("remove", "argument1", "argument2");

        expect(jagger.remove).toHaveBeenCalledWith("argument1", "argument2");
	});

   	describe("the instance", function() {
		it("should set the default values if the option is missing", function() {
			jagger = this.callJaggerWithAndGetInstance();

	   		expect( jagger.options.template ).toBe("#jagger-template");
	   	});

	   	it("should set a template selector if provided", function() {
	   		expect( jagger.options.template ).toBe("#my-template");
	   	});

	   	it("should remove the plugin when remove is called", function() {
	   		this.$el.jagger("remove");
	   		expect(this.getInstance()).not.toBeDefined();
	   	});

	   	describe("the stored pin element", function() {
			it("should support a string", function() {
				jagger = this.callJaggerWithAndGetInstance({
	   				pinElement: "<img class='pin' src='url/to/image.jpg'></img>"
				});
		   		expect( jagger.options.$pinElement ).toHaveClass("pin");
		   	});

	   	});
   	});

});