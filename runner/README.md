# Hello XplaRunner user!

## Create your first slide
```html
<!DOCTYPE html>
<html xp-run-server-url="http://xpla.org">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Angular2 Intro</title>
    <link type="text/css" rel="stylesheet" media="all" href="http://xpla.org/static/css/slide.3.0.0.css" />
  </head>
  <body class="xp-slide">
    <div class="xp-column" style="width:50%">
      <xp-editor>
        <script id="index.html" type="application/octetstream">
          <html>
            <head>
              <title>Angular 2 QuickStart</title>
              <script src="/cdn/systemjs/0.19.9/dist/system.js"><+/script>
              <script src="/cdn/angular.js/2.0.0-beta.0/angular2-polyfills.js"><+/script>
              <script src="/cdn/angular.js/2.0.0-beta.0/Rx.js"><+/script>
              <script src="/cdn/angular.js/2.0.0-beta.0/angular2.dev.js"><+/script>
              <script>
                System.import('./app.js');
              <+/script>
            </head>
            <body>
              <my-app>loading...</my-app>
          </body>
          </html>

        </script>
        <script id="app.ts" type="application/octetstream">
          import {Component} from 'angular2/core';
          import {bootstrap} from 'angular2/platform/browser';

          @Component({
              selector: 'my-app',
              template: '<h1>{{ hello }}</h1>'
          })
          class AppComponent {
              public hello:string = 'Hello, world!';
          }

          bootstrap(AppComponent);

        </script>
      </xp-editor>
    </div>
    <div class="xp-column" style="width:50%">
      <xp-preview runner="html-ts"></xp-preview>
    </div>
    <script src="http://xpla.org/static/js/slide.3.0.0.js"></script>
  </body>
</html>
```


## And your first deck
```html
<!DOCTYPE html>
<html xp-run-server-url="http://xpla.org/">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title></title>
    <link type="text/css" rel="stylesheet" media="all" href="http://xpla.org/static/css/deck.3.0.0.css" />
  </head>
  <body>
    <xp-deck>
      <link rel="import" href="slide.html" />
    </xp-deck>
    <script src="http://xpla.org/static/js/deck.3.0.0.js"></script>
  </body>
</html>
```


## And you are ready to go!
Just host those pages wherever you like (Github pages are ok).
For local development you can use for instance `live-server` or `python -m SimpleHTTPServer`
