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
        template: "#jagger-template"        
    };
    
    /* ==============================================
        Jagger Class
       ============================================== */

    function Jagger( element, options ) {
        this.options = $.extend({}, defaults, options);

        this.options.$pinElement = this._getjQueryInstanceFrom(this.options.pinElement);

        this.$el = $(element);

        return this;
    };

    Jagger.prototype = {
        _getjQueryInstanceFrom: function(elem) {
            elem = elem || "<div>";
            return (typeof elem !== "string" && "jquery" in elem) ? elem : $(elem);
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