#!/bin/bash

[ ! -z ${SKIP_TESTS+x} ] && [ "$SKIP_TESTS" == "true" ]
tests=$?

set -e

echo '----------------------Baking Slides---------------------------------'
cd slides
yarn install
if (( $tests == 1 )); then
  npm run test-ci
fi
npm run build
cd -

echo '----------------------Icing Runner----------------------------------'
cd runner
yarn install
npm run copy-config
if (( $tests == 1 )); then
  npm run test
fi
cd -

echo '----------------------Crafting Presence-----------------------------'
cd presence
yarn install
if (( $tests == 1 )); then
  npm run lint
fi
cd -

echo '----------------------Preparing git-to-slides archive --------------'
cd tools
rm -rf git-to-slides/node_modules || true
tar cvzf ../git-to-slides.tar.gz git-to-slides

if (( $tests == 1 )); then
  cd git-to-slides
  yarn install
  npm run lint
  cd ..
fi
cd ..


echo '----------------------Molding---------------------------------------'
cd runner
npm run clean_modules
cd -
rm -rf static || true
rm -rf presence/node_modules || true
cp slides/build static -r
cp git-to-slides.tar.gz static
npm run copy-config

tar cvzf xplarunner.tar.gz runner presence static

echo '----------------------Building GHSlides-----------------------------'
cd tools
rm -rf github-to-slides/node_modules || true
rm -rf git-to-slides/node_modules || true
tar cvzf ../ghslides.tar.gz *-to-slides

if (( $tests == 1 )); then
  cd github-to-slides
  yarn install
  npm run lint
  cd ..
fi
cd ..
