describe("jquery tagger", function() {
	var jagger;

	beforeEach(function() {
		this.initializeTestSuite();

		jagger = this.callJaggerAndGetInstance({
			selectors: {
				pin: ".my-custom-pin-class"
			},
   			template: "#my-template"
   		});
	});

    it("should be a method of a jquery instance", function() {
        expect( jQuery().jagger ).toBeDefined();
    });

   	it("should set the instance in the data attribute", function() {
   		expect( this.$el.data("jagger") ).toBeDefined();
	});

	it("should delegate the methods to the instance when a string is provided", function() {
        spyOn(jagger, "remove");
        this.$el.jagger("remove", "argument1", "argument2");

        expect(jagger.remove).toHaveBeenCalledWith("argument1", "argument2");
	});

	it("should set a click handler for the image", function() {
		expect(this.$img).toHandle("click.jagger"); 
	});

	describe("on click", function() {
		beforeEach(function() {
			var elementPosition = this.$el.position();
			var event = {
			    type: 'click',
				clientX: elementPosition.left + 20,
				clientY: elementPosition.top + 13
			};
		 	this.$img.trigger(event);
		});
		afterEach(function() {
			this.cleanUp();
		});

		it("should append a pin element to the container", function() {
		 	expect(this.$el).toContain("span.my-custom-pin-class");
		});

		it("should append the pin using the mouse coords", function() {
		 	var pinPosition = this.getPin().position();

		 	expect(Math.round(pinPosition.left)).toBe(20);
		 	expect(Math.round(pinPosition.top)).toBe(13);
		});

		it("should append the template", function() {
		 	expect(this.$el).toContain(".jagger-template-container");
		});

		it("should append the template contents", function() {
		 	expect( this.getTemplateContainer() ).toContain(".in-custom-template"); 
		});

		it("should append the template using the mouse coords", function() {
			var templatePosition = this.getTemplateContainer().position();

			// For now, the offset of the template is fixed in the code
		 	expect(Math.round(templatePosition.left)).toBe(50);
		 	expect(Math.round(templatePosition.top )).toBe(3);
		});

		it("should trigger the jagger:elementsAdded trigger", function() {
			spyOnEvent(this.$el.selector, "jagger:elementsAdded");

			this.$img.trigger("click");

			expect("jagger:elementsAdded").toHaveBeenTriggeredOnAndWith(this.$el.selector, jasmine.any(Object), jasmine.any(Object));
		});

		it("should allow selector customization", function() {
			this.callJaggerWith({
				selectors: {
					pin: 			   ".my-custom-pin-class",
					container:         ".my-custom-container",
					templateContainer: ".my-custom-template-container"
				}
			});
			this.$img.trigger("click");

		 	expect(this.$el).toContain(".my-custom-pin-class");
		 	expect(this.$el).toContain(".my-custom-container");
		 	expect(this.$el).toContain(".my-custom-template-container");
		});

		it("should not append another pin if the template is clicked", function() {
			this.getTemplateContainer().trigger("click");
			expect( $(".my-custom-pin-class").length ).toBe(1); 
		});

		it("should hide the other templates", function() {
			var hideSpy = spyOn(jQuery.fn, "hide").andCallThrough();

			this.$img.trigger("click");

		 	expect(hideSpy.mostRecentCall.object).toHaveClass("jagger-template-container");
		});

		it("should save a reference in to the template in the pin", function() {
			var $pin = this.getPin();
			var $template = this.getTemplateContainer();

			expect($pin.data("template")).toEqual($template);
		});

		it("should save a reference in to the pin in the template", function() {
			var $pin = this.getPin();
			var $template = this.getTemplateContainer();

			expect($template.data("pin")).toEqual($pin);
		});

		describe("When a templateLocation is specified", function() {
			beforeEach(function() {
				this.cleanUp();
				this.callJaggerWith({
					selectors: {
						templateLocation: ".my-custom-template-location"
					}
				});

				this.$img.trigger("click");
			});

			it("uses it to append the template onclick", function() {
				expect( $(".my-custom-template-location") ).not.toBeEmpty();
			});
			
		});

	});

	describe("on a custom jagger:event", function() {
		var $template, $pin;
		beforeEach(function() {
			this.$img.trigger("click");

			$template = this.getTemplateContainer();
			$pin = $(".my-custom-pin-class");
		});

		it("should show the template when the pin is clicked", function() {
			$template.hide();
			$pin.trigger("click.jagger"); 

			expect($template).toHaveCss({ display: "block" });
		});

		it("should hide the other templates when the pin is clicked", function() {
			this.$img.trigger("click");

			$pin.trigger("click.jagger"); 

			var $newTemplate = this.$el.find(".jagger-template-container").not($template);

			expect($newTemplate).toHaveCss({ display: "none" });
		});

		it("should delete the template and the pin on jagger:deleteTemplate", function() {
			var $templateParent =  $template.parent();

			$template.trigger("jagger:deleteTemplate"); 
			
			expect( $(".my-custom-pin-class, .jagger-template-container") ).not.toExist();
			expect( $templateParent ).not.toExist();
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
	   		// Show things
	   		this.$img.trigger("click");

	   		// Remove the plugin
	   		this.$el.jagger("remove");

	   		expect(this.$img).not.toHandle("click.jagger");
	   		expect(this.getInstance()).not.toBeDefined();
	   		expect(this.getPin()).not.toHandle("click");
	   		expect(this.getTemplateContainer()).not.toHandle("jagger:deleteTemplate");
	   	});

	   	describe("the stored pin element", function() {
			it("should support a string", function() {
		   		expect( this.resetPinWith("<img class='pin' src='url/to/image.jpg'></img>") ).toBeMatchedBy("img.pin");
		   	});

			it("should support a DOM element", function() {
				var img = document.createElement("img");
				img.className = "pin";

		   		expect( this.resetPinWith(img) ).toBeMatchedBy("img.pin");
		   	});

			it("should support a jQuery instance", function() {
				var $img = $("<img>", { "class": "pin" });
		   		expect( this.resetPinWith($img) ).toBeMatchedBy("img.pin");
		   	});

			it("should support a function that will get called on every click", function() {
				var counter = 0, i = 0;
				var pinGenerator = jasmine.createSpy('pinGenerator');

				pinGenerator.andCallFake(function(instance) {
					counter += 1;
					return '<span id="counter' + counter + '">' + counter + '</span>';
				});
				jagger = this.callJaggerAndGetInstance({
	   				pinElement: pinGenerator
				});

				while( (i++) < 5) {
		   			this.$img.trigger("click");
		   			expect( $("#counter" + i) ).toHaveHtml(i);
				}
		   		expect( pinGenerator ).toHaveBeenCalledWith( jagger );
		   	});
	   	});
   	});

	describe("the previously added elements", function() {
		var $container;
		beforeEach(function() {
			this.callJaggerWith({
				selectors: {
					onHover: ".pin-layout"
				},
				showPreviousElementsOnHover: true
			});
			$container = $(".jagger-pin-template-container");
		});	

		it("should not add the click event", function() {
			expect(this.$img).not.toHandle("click.jagger"); 
		});

		it("should have a mouseenter and mouseleave event", function() {
			expect($container).toHandle("mouseover");
		});

		it("should handle both if forceBoth is truthy", function() {
			this.callJaggerWith({
				forceBoth: true
			});

			expect(this.$img).toHandle("click.jagger"); 
			expect($container).toHandle("mouseover");
		});

		it("should not have a mouseenter and mouseleave event if showPreviousElementsOnHover is falsy", function() {
			this.callJaggerWith({ })
			expect($container).not.toHandle("mouseover");
		});

		it("should show the onHover element on mouseenter", function() {
			var wasHidden = $(".pin-layout").is(":hidden");
			var fadeSpy = spyOn(jQuery.fn, "fadeIn");

			$container.trigger("mouseover");

			expect(wasHidden).toBeTruthy();
		 	expect(fadeSpy.mostRecentCall.object).toHaveClass("pin-layout");
		});

		it("should hide the onHover element on mouseleave", function() {
			var fadeSpy = spyOn(jQuery.fn, "fadeOut");
			$container.trigger("mouseover").trigger("mouseleave");

		 	expect(fadeSpy.mostRecentCall.object).toHaveClass("pin-layout");
		});
	});
});