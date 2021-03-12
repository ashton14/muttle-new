#! /bin/bash

# Script depends on the installation of virtualenv
set -xe

cd backend
python3 -m virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
ln -s "$VIRTUAL_ENV/bin/mut.py" .
