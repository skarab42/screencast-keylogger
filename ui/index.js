var mouseColor    = "#b3b3b3";
var mouseBgColor  = "#ffffff";
var clickColor    = "#cc0000";
var dblClickColor = "#cc9900";
var highlightTime = 300; // ms

// -----------------------------------------------------------------------------

// Hooks options:
// hookKeyboard: ['KeyDown','KeyUp','KeyInput']
// hookMouse   : ['MouseWheel','MouseMove',
//                'MouseLeftUp','MouseLeftDown',
//                'MouseRightUp','MouseRightDown',
//                'MouseMiddleUp','MouseMiddleDown']

// var keylogger = new Keylogger({
//     debug       : true,
//     encoding    :'cp1252',
//     hookKeyboard: ['KeyDown'/*,'KeyUp','KeyInput'*/],
//     hookMouse   : false
// });

var keylogger = new Keylogger({
    debug       : true,
    encoding    :'cp1252',
    hookKeyboard: ['KeyDown','KeyUp','KeyInput'],
    hookMouse   : ['MouseWheel',/*'MouseMove',*/
                   'MouseLeftUp','MouseLeftDown',
                   'MouseRightUp','MouseRightDown',
                   'MouseMiddleUp','MouseMiddleDown']
});

// -----------------------------------------------------------------------------

var modifiers = {
    'Ctrl' : { down: false },
    'Alt'  : { down: false },
    'Shift': { down: false }
};

keylogger.onMouseWheel = function(data) {
    highlightMouseWheel(data.wheel > 0 ? wheelUp : wheelDown);
};

keylogger.onMouseLeftDown = function(data) {
    highlightMouseButton(leftButton);
};

keylogger.onMouseRightDown = function(data) {
    highlightMouseButton(rightButton);
};

keylogger.onMouseMiddleDown = function(data) {
    highlightMouseButton(middleButton);
};

function getPrintableKey(data) {
    return data.printable ? data.char : data.keyName;
}

function getModifiersKeys() {
    var keys = [];

    for (var key in modifiers) {
        if (modifiers[key].down) {
            keys.push(key);
        }
    }

    return keys;
}

function getModifier(data) {
    return modifiers[data.keyName];
}

var lastInputTime = 0;
var lastInputKey  = null;
var comboTimeout  = 1000;
var specialsChars = {
    'Space': [' '],
    'Tab'  : ['\t'],
    'Enter': ['&crarr;', '\n']
};
var lastCounter = null;
var reapetCount = 2;

function isPrintable(data) {
    return data.printable || specialsChars[getPrintableKey(data)];
}

function waitForInputString(data) {
    var key  = getPrintableKey(data);
    var time = Date.now();

    if (isPrintable(data) && time - lastInputTime < comboTimeout) {
        var sc = specialsChars[key];
        if (sc) {
            key = newKey(sc[0]).outerHTML + (sc[1] || '');
        }
        lastInputKey  = null;
        lastInputTime = time;
        return appendKey(key);
    }

    if (key === lastInputKey && time - lastReapetTime < comboTimeout) {
        var counter = lastCounter || newCounter();
        counter.innerHTML = 'x' + reapetCount;

        if (! lastCounter) {
            appendKey(counter.outerHTML);
        }
        else {
            var parent = keyboard.lastChild.lastChild;
            parent.replaceChild(counter, parent.lastChild);
        }

        lastReapetTime = time;
        lastCounter    = counter;
        return reapetCount++;
    }

    var keys = getModifiersKeys();

    keys.push(key);
    addCombo(keys);

    lastInputKey   = key;
    lastInputTime  = time;
    lastReapetTime = time;
    lastCounter    = null;
    reapetCount    = 2;

    if (! data.printable) {
        lastInputTime = 0;
    }
}

keylogger.onKeyInput = function(data) {
    var modifier = getModifier(data);

    if (modifier) {
        modifier.down = true;
    }
    else {
        waitForInputString(data);
    }
};

keylogger.onKeyUp = function(data) {
    var modifier = getModifier(data);

    if (modifier) {
        modifier.down = false;
    }
};

// -----------------------------------------------------------------------------

var leftButton, middleButton, rightButton, wheelUp, wheelDown,
    mouseBody, mouseBd;

var mouse    = document.getElementById('mouse');
var keyboard = document.getElementById('keyboard');
var overlay  = document.getElementById('overlay');

overlay.addEventListener("contextmenu", function(event) {
    event.preventDefault();
}, false);

function toggleButton(button, visible) {
    button.style.visibility = visible ? 'visible' : 'hidden';
}

mouse.addEventListener("load", function() {
    var doc      = mouse.contentDocument;
    leftButton   = doc.getElementById("leftButton");
    middleButton = doc.getElementById("middleButton");
    rightButton  = doc.getElementById("rightButton");
    wheelUp      = doc.getElementById("wheelUp");
    wheelDown    = doc.getElementById("wheelDown");
    mouseBg      = doc.getElementById("background");
    mouseBody    = doc.getElementById("body");

    mouseBody.style.fill = mouseColor;
    mouseBg.style.fill   = mouseBgColor;

    toggleButton(wheelUp, false);
    toggleButton(wheelDown, false);
}, false);

function highlightMouseButton(button) {
    button.style.fill = button.style.fill === clickColor ? dblClickColor : clickColor;
    setTimeout(function() {
        button.style.fill = mouseColor;
    }, highlightTime);
}

function highlightMouseWheel(button) {
    button.style.fill = clickColor;
    toggleButton(button, true)
    setTimeout(function() {
        toggleButton(button, false)
    }, highlightTime);
}

function newKey(label) {
    var key = document.createElement("div");
    key.className = 'key';
    key.innerHTML = label;
    return key;
}

function newSep() {
    var sep = document.createElement("div");
    sep.className = 'sep';
    sep.innerHTML = '+';
    return sep;
}

function newCounter() {
    var sep = document.createElement("div");
    sep.className = 'counter';
    sep.innerHTML = 'x2';
    return sep;
}

function newCombo(labels) {
    var combo = document.createElement("div");
    combo.className = 'combo';

    for (var i = 0, il = labels.length; i < il; i++) {
        combo.appendChild(newKey(labels[i]));
        i < il - 1 && combo.appendChild(newSep());
    }

    return combo;
}

function addKey(key) {
    keyboard.appendChild(newKey(key));
}

function addCombo(keys) {
    keyboard.appendChild(newCombo(keys));
}

function appendKey(key) {
    var obj = keyboard.lastChild.lastChild;
    obj.className += ' str';
    obj.innerHTML += key;
}
