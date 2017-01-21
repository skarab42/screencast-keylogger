#!/usr/bin/env python
# -*- coding: utf-8 -*-

import gi
gi.require_version('Gtk', '3.0')

from gi.repository import Gtk
from lib.keylogger import Keylogger
import sys, os

title = "screencast-keylogger"
main  = "index.html"
root  = os.path.join(os.path.dirname(__file__), "ui")

if __name__ == "__main__":
    Keylogger(root, main, title)
    Gtk.main()
