############################################
#               EXTERNAL                   #
############################################

location /ext/convert/ {
  proxy_cache {{ server_id }}one;
  proxy_cache_valid 200 60m;
  add_header X-Cache-Status $upstream_cache_status;

  proxy_ignore_headers "Cache-Control";
  proxy_pass http://api.fixer.io/;
  proxy_set_header Host api.fixer.io;
  proxy_set_header X-Real-IP $remote_addr;
}

location /ext/itunes/ {
  proxy_cache {{ server_id }}one;
  proxy_cache_valid 200 60m;
  add_header X-Cache-Status $upstream_cache_status;

  proxy_ignore_headers "Cache-Control";
  proxy_pass https://itunes.apple.com/;
  proxy_set_header X-Real-IP $remote_addr;
  add_header User-Agent xplatform;
}

location /ext/github/ {
  proxy_cache {{ server_id }}one;
  proxy_cache_valid 200 60m;
  add_header X-Cache-Status $upstream_cache_status;

  proxy_ignore_headers "Cache-Control";
  proxy_pass https://api.github.com/;
  proxy_set_header X-Real-IP $remote_addr;
  add_header User-Agent xplatform;

  # TODO [ToDr] This is needed to overcome issues with https redirection after accessing api
  proxy_hide_header Strict-Transport-Security;
}

location /ext/lorempixel/ {
  proxy_cache {{ server_id }}one;
  proxy_cache_valid 200 60m;
  proxy_ignore_headers X-Accel-Expires;
  proxy_ignore_headers Expires;
  proxy_ignore_headers Cache-Control;
  proxy_hide_header Cache-Control;
  add_header X-Cache-Status $upstream_cache_status;

  proxy_pass http://lorempixel.com/;
  proxy_set_header REFERER "https://xpla.org";
}

location /ext/requestbin {
  proxy_pass http://requestb.in/;
  proxy_set_header Host      $host;
  proxy_set_header X-Real-IP $remote_addr;
}

############################################
#               INTERNAL                   #
############################################

location /static {
  root /srv/{{ server_name }}/;

  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_types text/plain text/css application/javascript application/x-javascript text/javascript;

  expires 30m;
  add_header Cache-Control "public";
}

location /cdn {
  root /srv/{{ server_name }}/runner/;

  gzip on;
  gzip_types text/plain application/x-javascript application/javascript text/css application/octet-stream;

  expires 365d;
}

location / {
  proxy_pass http://{{ server_id }};
  proxy_set_header Host      $host;
  proxy_set_header X-Real-IP $remote_addr;
}

error_page 502 /offline.html;
location = /offline.html {
  root /srv/{{ server_name }}/static/;
}
