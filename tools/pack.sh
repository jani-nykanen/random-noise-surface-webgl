#!/bin/sh
cd "$(dirname "$0")"
./compile.sh
cat html_top.txt > index.html
cat out.js >> index.html
cat html_bottom.txt >> index.html
if [ -f ../dist.zip ]; then
    rm ../dist.zip
fi
zip -r ../dist.zip index.html
