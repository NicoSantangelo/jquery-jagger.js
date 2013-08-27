;(function ($, undefined) {
    "use strict";

    // Dependencies
    if ($ === undefined) {
        throw "jQuery should be defined to use jagger";
    }

    var pluginName = "jagger",
        pluginDataName = pluginName;

    // jagger defaults
    var defaults = {
        template: "#jagger-template",
        pinElement: "<span class='pin'></span>"
    };
    
    /* ==============================================
        Jagger Class
       ============================================== */

    function Jagger( element, options ) {
        // Set the default options
        this.options = $.extend({}, defaults, options);

        // Set the inner jquery instance for the pin
        this.$pinElement = this._getjQueryInstanceFrom(this.options.pinElement);

        // Find and store the template
        this.$template = this._getjQueryTemplateContainer(this.options.template);

        // Container jquery element
        this.$el = $(element);

        this.setOnClickHandler();

        return this;
    };

    Jagger.prototype = {
        _getjQueryInstanceFrom: function(elem) {
            elem = elem || "<div>";
            return (typeof elem !== "string" && "jquery" in elem) ? elem : $(elem);
        },
        _getjQueryTemplateContainer: function(templateSelector) {
            var templateContainer = document.createElement("div");
            templateContainer.className = "jagger-template-container";
            templateContainer.innerHTML = $(this.options.template).html();

            return $(templateContainer);
        },
        setOnClickHandler: function(event) {
            var self = this;

            this.$el.on("click.jagger", function(event) {
                // Clone the pin and the template so we can append them
                var $pin      = self.$pinElement.clone();
                var $template = self.$template.clone();

                // Mouse position onclick
                var mouseCoords = {
                    x: event.clientX,
                    y: event.clientY
                };

                var pinPosition = self.determinePinPosition(mouseCoords);

                $pin.css(pinPosition).appendTo(this);

                $template.css( self.determineTemplatePosition(pinPosition) ).appendTo(this)
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
            pinPosition.top  -= 10;
            pinPosition.left += 30;
            return pinPosition;
        },
        getElOffset: function() {
            var $window  = $(window);
            var elOffset = this.$el.offset();
            return {
                x: elOffset.left - $window.scrollLeft(),
                y: elOffset.top  - $window.scrollTop()
            };
        },
        remove: function() {
            this.$el.removeData(pluginDataName);
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
                var instance = $.data(this, pluginDataName);
                if (!instance) {
                    throw "Method called on jagger before instantiation";
                }
                if ( !$.isFunction(instance[options]) ) {
                    throw "The method: " + options + " was not found in jagger";
                }

                var returnValue = instance[options].apply(instance, methodArguments);

                if (returnValue !== undefined) {
                    return returnValue;
                }
            } else {
                // Create only one instance
                if ( !$.data(this, pluginDataName) ) {
                    $.data(this, pluginDataName, new Jagger( this, options ));
                }
            }
        });
    };

    window.Jagger = Jagger;

})( jQuery );