;(function ($, undefined) {
    "use strict";

    // Dependencies
    if ($ === undefined) {
        throw "jQuery should be defined to use jagger";
    }

    var pluginName = "jagger",
        prefix      = pluginName + "-",
        classPrefix = "." + prefix,
        idPrefix    = "#" + prefix;

    var classes = {
        pin:               classPrefix + "pin",
        container:         classPrefix + "pin-template-container",
        templateContainer: classPrefix + "template-container"
    };

    // jagger defaults
    var defaults = {
        template: idPrefix + "template",
        pinElement: "<span class='" + classes.pin.slice(1) + "'></span>"
    };

    
    /* ==============================================
        Jagger Class
       ============================================== */

    function Jagger( element, options ) {
        // Set the default options
        this.options = $.extend({}, defaults, options);

        // Container jquery element
        this.$el = $(element);

        this._onClick();

        this._onHover();

        return this;
    }

    Jagger.prototype = {
        _onHover: function() {
            if(this.options.onHoverShow) {
                var onHoverselector = this.options.onHoverShow;

                $(classes.container).on("mouseenter.jagger", function() {
                    $(this).find(onHoverselector).fadeIn("fast");
                }).on("mouseleave.jagger", function() {
                    $(this).find(onHoverselector).stop().fadeOut('fast');
                });
                
            }
        },
        getContainer: function() {
            var pinTemplateContainer = document.createElement("div");
            pinTemplateContainer.className = classes.container.slice(1);

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

            templateContainer.className = classes.templateContainer.slice(1);
            templateContainer.innerHTML = $(this.options.template).html();

            return this._setTemplateHandlers( $(templateContainer) );
        },
        _onClick: function() {
            var self = this;

            this.$el.on("click.jagger", function(event) {
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
                
                $container.append($pin.css(pinPosition), $template.css(templatePosition)).appendTo(this);

                self.$el.trigger("jagger:elementsAdded", [ pinPosition, templatePosition ]);
            });
            return this;
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
            return $pin.on("click.jagger", function() {
                $pin.siblings(classes.templateContainer).show();
                return false;
            });
        },
        _setTemplateHandlers: function($template) {
            return $template.on("jagger:deleteTemplate", function() {
                $template.parent().remove();
            });
        },
        remove: function() {
            this.$el.removeData(pluginName);
            $(classes.templateContainer).off("jagger:deleteTemplate");
            $(classes.pin).off(".jagger");
            $(classes.container).off(".jagger");
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

    window.Jagger = Jagger;

})( jQuery );