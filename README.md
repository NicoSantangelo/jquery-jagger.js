Javascript tAGGER
=============

This plugin allows you to tag certain areas of a photo (or any element).

Usage
-----

### Default options
```javascript
$(selector).jagger({
        selectors: {
            taggeable:         "img", 
            pin:               ".jagger-pin",
            container:         ".jagger-pin-template-container",
            onHover:           ".jagger-pin-on-hover",
            templateContainer: ".jagger-template-container",
            templateLocation:  ""
        },
        template: "#jagger-template",
        leaveTemplatesOpen: false,
        showPreviousElementsOnHover: false,
        pinElement: function() {
            return "<span class='jagger-pin'></span>";
        }
});
```

DISCLAIMER: This plugin is still in a "I have little free time to finish it" phase, use it at your own risk.