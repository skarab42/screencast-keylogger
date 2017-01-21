// Settings
// hookKeyboard: ['KeyDown','KeyUp','KeyInput']
// hookMouse   : ['MouseWheel','MouseMove',
//                'MouseLeftUp','MouseLeftDown',
//                'MouseRightUp','MouseRightDown',
//                'MouseMiddleUp','MouseMiddleDown']

function Keylogger(settings) {
    this.settings = {
        debug       : true,
        hookKeyboard: true,
        hookMouse   : true,
        encoding    :'cp1252'
    };

    this.updateSettings(settings);
}

Keylogger.prototype.updateSettings = function(settings) {
    if (typeof settings === 'object') {
        for (var setting in settings) {
            if (settings.hasOwnProperty(setting)) {
                this.settings[setting] = settings[setting];
            }
        }
    }

    document.title = JSON.stringify(this.settings);
};

Keylogger.prototype.on = function(event, data) {};

Keylogger.prototype.onKeyUp    = function(data) {};
Keylogger.prototype.onKeyDown  = function(data) {};
Keylogger.prototype.onKeyInput = function(data) {};

Keylogger.prototype.onMouseMove       = function(data) {};
Keylogger.prototype.onMouseWheel      = function(data) {};
Keylogger.prototype.onMouseLeftUp     = function(data) {};
Keylogger.prototype.onMouseLeftDown   = function(data) {};
Keylogger.prototype.onMouseRightUp    = function(data) {};
Keylogger.prototype.onMouseRightDown  = function(data) {};
Keylogger.prototype.onMouseMiddleUp   = function(data) {};
Keylogger.prototype.onMouseMiddleDown = function(data) {};
