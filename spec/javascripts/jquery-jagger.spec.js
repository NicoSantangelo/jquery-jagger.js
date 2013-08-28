describe("jquery tagger", function() {
	var jagger;

	beforeEach(function() {
		this.initializeTestSuite();

		jagger = this.callJaggerAndGetInstance({
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

	it("should set a click handler for the container element", function() {
		expect(this.$el).toHandle("click.jagger"); 
	});

	describe("on click", function() {
		beforeEach(function() {
			var elementPosition = this.$el.position();
			var event = {
			    type: 'click',
				clientX: elementPosition.left + 20,
				clientY: elementPosition.top + 13
			};
		 	this.$el.trigger(event);
		});

		it("should append a pin element to the container", function() {
		 	expect(this.$el).toContain("span.jagger-pin");
		});

		it("should append the pin using the mouse coords", function() {
		 	var pinPosition = this.$el.find("span.jagger-pin").position();

		 	expect(pinPosition.left).toBe(20);
		 	expect(pinPosition.top ).toBe(13);
		});

		it("should append the template", function() {
		 	expect(this.$el).toContain(".jagger-template-container"); 
		 	expect( this.$el.find(".jagger-template-container") ).toContain(".in-custom-template"); 
		});
		it("should append the template using the mouse coords", function() {
			var templatePosition = this.getTemplateContainer().position();

			// For now, the offset of the template is fixed in the code
		 	expect(templatePosition.left).toBe(50);
		 	expect(templatePosition.top ).toBe(3);
		});
		it("should store the pin coords on the containers data", function() {
			var pinCoords = $(".jagger-pin-template-container").data("jagger:pinCoords");

			expect(pinCoords.left).toBe(20);
			expect(pinCoords.top ).toBe(13);
		});
	});

	describe("on a custom jagger:event", function() {
		var $template, $pin;
		beforeEach(function() {
			this.$el.trigger("click");

			$template = this.getTemplateContainer();
			$pin = $(".jagger-pin");
		});
		it("should show the template when the pin is clicked", function() {
			$template.hide();
			$pin.trigger("click.jagger"); 

			expect($template).toHaveCss({ display: "block" });
		});
		it("should delete the template and the pin on jagger:deleteTemplate", function() {
			$template.trigger("jagger:deleteTemplate"); 
			
			expect( $(".jagger-pin-template-container") ).not.toExist();
		});
	});

   	describe("the instance", function() {
		it("should set the default values if the option is missing", function() {
			jagger = this.callJaggerAndGetInstance();
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
		   		expect( this.getPinElement.call(this, "<img class='pin' src='url/to/image.jpg'></img>") ).toBeMatchedBy("img.pin");
		   	});
			it("should support a DOM element", function() {
				var img = document.createElement("img");
				img.className = "pin";

		   		expect( this.getPinElement.call(this, img) ).toBeMatchedBy("img.pin");
		   	});
			it("should support a jQuery instance", function() {
				var $img = $("<img>", { "class": "pin" });
		   		expect( this.getPinElement.call(this, $img) ).toBeMatchedBy("img.pin");
		   	});
			it("should support a function that will get called on every click", function() {
				var counter = 0;
				var pinGenerator = jasmine.createSpy('pinGenerator');

				pinGenerator.andCallFake(function(instance) {
					counter += 1;
					return '<span id="counter' + counter + '">' + counter + '</span>';
				});

				jagger = this.callJaggerAndGetInstance({
	   				pinElement: pinGenerator
				});

		   		this.$el.trigger("click");
		   		expect( $("#counter1") ).toHaveHtml(1);

		   		this.$el.trigger("click");
		   		expect( $("#counter2") ).toHaveHtml(2);

		   		expect( pinGenerator ).toHaveBeenCalledWith( jagger );
		   	});
	   	});
   	});
});