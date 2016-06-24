# Hello XplaRunner user!

## Create your first slide
```html
<!DOCTYPE html>
<html xp-run-server-url="https://xpla.org">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Angular2 Intro</title>
    <script src="https://xpla.org/static/js/slide_loader.3.0.0.js"></script>
  </head>
  <body class="xp-slide">
    <div class="xp-row with-comments">
      <div class="xp-column" style="width:50%">
        <xp-editor tree>
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
          <script id="app.ts" type="application/octetstream" highlight>
            import {Component} from 'angular2/core';
            import {bootstrap} from 'angular2/platform/browser';

            //4/ We are using TypeScript annotations
            @Component({
                selector: 'my-app',
                template: '<h1>{{ hello }}</h1>'
            })
            class AppComponent {
                public hello:string = 'Hello, world!';
            }

            // And then bootstrap the application
            bootstrap(AppComponent);

          </script>
        </xp-editor>
      </div>
      <div class="xp-resize-column"></div>
      <div class="xp-column" style="width:50%">
        <xp-preview runner="html-ts"></xp-preview>
      </div>
    </div>
    <div class="xp-resize-row"></div>
    <div class="xp-row comments">
        <xp-annotations>
          <header><h1>My first slide</h1></header>
          <details>
            <p>Let's see the annotations, shall we?</p>
          </details>
          <aside file="app.ts" order="1">
            <p>Annotations are used in Angular2 everywhere!</p>
          </aside>
        </xp-annotations>
    </div>
  </body>
</html>
```


## And your first deck
```html
<!DOCTYPE html>
<html xp-run-server-url="https://xpla.org">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title></title>
    <link type="text/css" rel="stylesheet" media="all" href="https://xpla.org/static/css/deck.3.0.0.css" />
  </head>
  <body>
    <xp-deck back="../">
      <link async rel="import" href="slide.html" title="Short Title" />
    </xp-deck>
    <script async src="https://xpla.org/static/js/deck.3.0.0.js"></script>
  </body>
</html>
```


## And you are ready to go!
Just host those pages wherever you like (Github pages are ok).
For local development you can use for instance `live-server` or `python -m SimpleHTTPServer`
