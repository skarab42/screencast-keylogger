# -*- coding: utf-8 -*-

import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit', '3.0')

from gi.repository import Gtk, WebKit
import os, urlparse, pyHook, json, time, re
from pyHook import GetKeyState

data_properties = ['Alt','Ascii','Extended','flags','Injected','Key','KeyID',
                    'Message','MessageName','ScanCode','Time','Transition',
                    'Window','WindowName','Position','Wheel',
                    'Char', 'State', 'Printable', 'KeyName']

keyboard_hooks = ['KeyDown','KeyUp','KeyInput']
mouse_hooks    = ['MouseWheel','MouseMove',
                  'MouseLeftUp','MouseLeftDown',
                  'MouseRightUp','MouseRightDown',
                  'MouseMiddleUp','MouseMiddleDown']

keys_names = {
    'Control': 'Ctrl', 'Lcontrol': 'Ctrl', 'Rcontrol': 'Ctrl',
    'Menu': 'Alt', 'Lmenu': 'Alt', 'Rmenu': 'Alt',
    'Lshift': 'Shift', 'Rshift': 'Shift',
    'Lwin': 'Win', 'Rwin': 'Win',
    'Capital': 'Caps Lock',
    'Return': 'Enter'}

def camelCase(s):
    return s[0].lower() + s[1:]

class Keylogger(Gtk.Window):

    def __init__(self, root, main='index.html', title='Keylogger'):
        Gtk.Window.__init__(self, title=title)

        self.settings = None
        self.debug    = True
        self.hm       = None
        self.keysDown = {}

        self.root = os.path.realpath(root)
        self.main = main

        self.connect('delete-event', Gtk.main_quit)

        icon = os.path.join(root, 'favicon.ico')
        self.set_icon_from_file(icon)

        self.set_default_size(400, 80)
        self.set_keep_above(True)

        scroll = Gtk.ScrolledWindow() # AUTOMATIC, ALWAYS, NEVER
        scroll.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)

        self.view = WebKit.WebView()
        self.view.connect('load-finished', self.set_hooks)
        self.load_file(self.main)

        scroll.add(self.view)
        self.add(scroll)

        self.show_all()
        print 'Ready !'

    def load_file(self, filename):
        uri = os.path.realpath(os.path.join(self.root, filename))
        uri = urlparse.ParseResult('file', '', uri, '', '', '')
        uri = urlparse.urlunparse(uri)
        self.view.load_uri(uri)

    def cb(self, name):
        return lambda data: self.on(name, data)

    def get_settings(self):
        self.js('updateSettings()')
        frame = self.view.get_main_frame()
        return json.loads(frame.get_title())

    def unset_hooks(self):
        if self.hm:
            del self.hm

    def isKeyDown(self, code):
        return code in self.keysDown and self.keysDown[code]

    def onKeyInput(self, event):
        hookKeyboard = self.settings['hookKeyboard']
        if hookKeyboard == True or 'KeyInput' in hookKeyboard:
            self.on('KeyInput', event)
        return True

    def fixKeyEvent(self, event):
        event.State     = GetKeyState(event.KeyID)
        event.KeyName   = event.Key
        event.Char      = event.Key
        event.Printable = False

        try:
            code = event.Ascii
            if code > 32 and code < 255:
                event.Char      = chr(event.Ascii)
                event.Printable = True
        except Exception as e:
            pass

        if not event.Printable and event.KeyName in keys_names:
            event.KeyName = keys_names[event.KeyName]

    def onKeyDown(self, event):
        self.fixKeyEvent(event)

        code = event.ScanCode
        if self.isKeyDown(code):
            return self.onKeyInput(event)
        self.keysDown[code] = True

        hookKeyboard = self.settings['hookKeyboard']
        if hookKeyboard == True or 'KeyDown' in hookKeyboard:
            self.on('KeyDown', event)

        return self.onKeyInput(event)

    def onKeyUp(self, event):
        self.fixKeyEvent(event)

        self.keysDown[event.ScanCode] = False
        hookKeyboard = self.settings['hookKeyboard']
        if hookKeyboard == True or 'KeyUp' in hookKeyboard:
            self.on('KeyUp', event)
        return True

    def set_hooks(self, view=None, frame=None):
        self.settings = self.get_settings()
        self.log('Settings = ' + json.dumps(self.settings))

        self.debug = self.settings['debug']
        self.hm    = pyHook.HookManager()

        self.hm.KeyUp   = self.onKeyUp
        self.hm.KeyDown = self.onKeyDown

        if self.settings['hookKeyboard']:
            self.hm.HookKeyboard()

        hookMouse = self.settings['hookMouse']

        if hookMouse:
            if hookMouse == True:
                hookMouse = mouse_hooks
            if isinstance(hookMouse, list):
                for hook in hookMouse:
                    if hook in mouse_hooks:
                        setattr(self.hm, hook, self.cb(hook))
                self.hm.HookMouse()

    def log(self, text):
        if self.debug:
            print '##', text, '\n'

    def js(self, code):
        self.view.execute_script('keylogger.' + code)

    def json_encode(self, s):
        if not isinstance(s, basestring):
            return s
        encoding = self.settings['encoding']
        return s.decode(encoding).encode('utf-8')

    def on(self, name, data):
        json_data = {}
        for attr in data_properties:
            if hasattr(data, attr):
                json_data[camelCase(attr)] = self.json_encode(getattr(data, attr))
        json_data = json.dumps(json_data)

        self.js('on(\'' + camelCase(name) + '\',' + json_data + ')')
        self.js('on' + name + '(' + json_data + ')')
        self.log(name + ' = ' + json_data)

        settings = self.get_settings()
        if self.settings != settings:
            self.unset_hooks()
            self.set_hooks()

        return True
