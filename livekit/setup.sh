#!/bin/bash

pip install -r requirements.txt
pip install -e ./livekit-plugins-smallest --config-settings editable_mode=strict
pip install -e ./livekit-plugins-sarvam --config-settings editable_mode=strict
