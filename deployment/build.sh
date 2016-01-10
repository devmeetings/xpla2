#!/bin/sh

set -e

echo '----------------------Baking Slides----------------------------------'
cd slides
npm install
# npm run test-ci
npm run build
cd -

echo '----------------------Icing Runner----------------------------------'
cd runner
npm install
# npm run test
cd -


echo '----------------------Molding----------------------------------'
cd runner
npm run clean_modules
rm -rf static || true
cp slides/build static -r
tar cvzf xplarunner.tar.gz runner static

