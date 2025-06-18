#!/bin/bash
set -e
npm run build
cp .nojekyll dist/
cp 404.html dist/
git checkout gh-pages || git checkout --orphan gh-pages
git --work-tree dist add --all
git --work-tree dist commit -m 'Deploy to gh-pages' || echo 'No changes to commit'
git push origin gh-pages --force
git checkout -
