#!/bin/sh

set -e

echo '----------------------Baking Slides---------------------------------'
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

echo '----------------------Preparing git-to-slides archive --------------'
cd tools
tar cvzf ../git-to-slides.tar.gz git-to-slides
cd -


echo '----------------------Molding---------------------------------------'
cd runner
npm run clean_modules
cd -
rm -rf static || true
cp slides/build static -r
cp git-to-slides.tar.gz static

tar cvzf xplarunner.tar.gz runner static

echo '----------------------Building GHSlides-----------------------------'
cd tools
tar cvzf ../ghslides.tar.gz *-to-slides
cd -
