;(function ($, undefined) {
    "use strict";

    // Dependencies
    if ($ === undefined) {
        throw "jQuery should be defined to use jagger";
    }

    var pluginName = "jagger",
        prefix      = pluginName + "-",
        classPrefix = "." + prefix;

    var selectors = {
        taggeable:         "img", 
        pin:               classPrefix + "pin",
        container:         classPrefix + "pin-template-container",
        onHover:           classPrefix + "pin-on-hover",
        templateContainer: classPrefix + "template-container",
        templateLocation:  ""
    };

    var removeDot = function(text) {
        return text.replace(/^\./, "");
    };

    // jagger defaults
    var defaults = {
        selectors: selectors,
        template: "#" + prefix + "template",
        leaveTemplatesOpen: false,
        showPreviousElementsOnHover: false,
        pinElement: function(instance) {
            return "<span class='" + removeDot(instance.selectors.pin) + "'></span>";
        }
    };

    
    /* ==============================================
        Jagger Class
       ============================================== */

    function Jagger( element, options ) {
        // Set the default options
        this.options = $.extend({}, defaults, options);

        // Handy shortcut
        this.selectors = $.extend({}, defaults.selectors, this.options.selectors);

        // Container jquery element
        this.$el = $(element);

        this.addHandlers();

        return this;
    }

    Jagger.prototype = {
        addHandlers: function() {
            if(this.options.forceBoth) {
                this._onHover();
                this._onClick();
            } else if(this.options.showPreviousElementsOnHover) {
                this._onHover();
            } else {
                this._onClick();
            }
            return this;
        },
        _onHover: function() {
            var selectors = this.selectors;

            $(selectors.container).on("mouseenter.jagger", function() {
                $(this).find(selectors.onHover).fadeIn("fast");
            }).on("mouseleave.jagger", function() {
                $(this).find(selectors.onHover).stop().fadeOut('fast');
            });
        },
        _onClick: function() {
            var self = this;
            var selectors = this.selectors;

            this.$el.children(selectors.taggeable).on("click.jagger", function(event) {
                var $container = self.getContainer();
                var $template  = self.getTemplate();
                var $pin       = self.getPin();

                // Mouse position onclick
                var mouseCoords = {
                    x: event.clientX,
                    y: event.clientY
                };

                var pinPosition      = self.determinePinPosition(mouseCoords);
                var templatePosition = self.determineTemplatePosition(pinPosition);
                     
                if(!self.options.leaveTemplatesOpen) {
                    // Close previously opened templates
                    $(selectors.templateLocation).find(selectors.templateContainer).hide();
                    self.$el.find(selectors.templateContainer).hide();
                }

                // Add the css and save a reference for later use
                $pin.css(pinPosition).data("template", $template);
                $template.css(templatePosition).data("pin", $pin);

                // if a template location exists use it to append the template there, otherwise use the container
                if(selectors.templateLocation) {
                    $(selectors.templateLocation).append($template);
                } else {
                    $container.append($template);
                }

                // Append the pin and append the conainer to the DOM
                $container.append($pin).appendTo(self.$el);

                self.$el.trigger("jagger:elementsAdded", [ pinPosition, templatePosition ]);
            });
            return this;
        },
        getContainer: function() {
            var pinTemplateContainer = document.createElement("div");
            pinTemplateContainer.className = removeDot(this.selectors.container);

            return $(pinTemplateContainer);
        },
        getPin: function() {
            var pin = this.options.pinElement;

            if($.isFunction(pin)) {
                pin = pin(this);
            }
            pin = pin || defaults.pinElement;

            var $pin = (typeof pin !== "string" && "jquery" in pin) ? pin : $(pin);

            return this._setPinHandlers( $pin );
        },
        getTemplate: function() {
            var templateContainer = document.createElement("div");

            templateContainer.className = removeDot(this.selectors.templateContainer);
            templateContainer.innerHTML = $(this.options.template).html();

            return this._setTemplateHandlers( $(templateContainer) );
        },
        determinePinPosition: function(mouseCoords) {
            var elCoords = this.getElOffset();
            return {
                position: "absolute",
                top : mouseCoords.y - elCoords.y,
                left: mouseCoords.x - elCoords.x
            };
        },
        determineTemplatePosition: function(pinPosition) {
            //Fixed for now
            return {
                position: "absolute",
                top:  pinPosition.top - 10,
                left: pinPosition.left + 30
            };
        },
        getElOffset: function() {
            var $window  = $(window);
            var elOffset = this.$el.offset();
            return {
                x: elOffset.left - $window.scrollLeft(),
                y: elOffset.top  - $window.scrollTop()
            };
        },
        _setPinHandlers: function($pin) {
            var $el = this.$el;
            var selectors = this.selectors;

            return $pin.on("click.jagger", function() {
                $el.find(selectors.templateContainer).hide();
                $(selectors.templateLocation).find(selectors.templateContainer).hide();

                $pin.data("template").show();
                return false;
            });
        },
        _setTemplateHandlers: function($template) {
            var selectors = this.selectors;

            return $template.on("jagger:deleteTemplate", function() {
                // Remove the pin
                $template.data("pin").parents(selectors.container).remove();

                if(selectors.templateLocation) {
                    $template.remove();    
                }
            });
        },
        remove: function() {
            this.$el.removeData(pluginName);

            this.$el.children(this.selectors.taggeable).off(".jagger");
            $(this.selectors.templateContainer).off("jagger:deleteTemplate");
            $(this.selectors.pin + ", " + this.selectors.container).off(".jagger");

            return this.$el;
        }
    };

    /* ==============================================
        jQuery Plugin initialization
       ============================================== */

    $.fn[pluginName] = function ( options ) {
        var isMethod = typeof options === 'string';
        if(isMethod) {
            var methodArguments = Array.prototype.slice.call(arguments, 1);
        }

        return this.each(function() {
            // When the first argument is a string, call a method on the instance with that string as the method name
            // Otherwise instantiate the plugin
            if (isMethod) {
                var instance = $.data(this, pluginName);
                if (!instance) {
                    throw "Method called on jagger before instantiation ";
                }
                if ( !$.isFunction(instance[options]) ) {
                    throw "The method: " + options + " was not found in jagger";
                }

                instance[options].apply(instance, methodArguments);
            } else {
                // Create only one instance
                if ( !$.data(this, pluginName) ) {
                   $.data(this, pluginName, new Jagger( this, options ));
                }
            }
        });
    };

})( jQuery );