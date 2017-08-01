############################################
#               SLIDES                     #
############################################

location /slides/react-redux/ {
  proxy_pass http://wkwiatek.github.io/devmeeting-react-todoapp/;
  proxy_set_header X-Real-IP $remote_addr;

  location = /slides/react-redux/ {
    proxy_pass http://wkwiatek.github.io/devmeeting-react-todoapp/;
    proxy_set_header X-Real-IP $remote_addr;

    # react-redux / 7843
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/{{ server_name }}-htpasswd;
  }
}

location /slides/angular2/ {
  proxy_pass http://kapke.github.io/angular2-shop/;
  proxy_set_header X-Real-IP $remote_addr;
}

location /slides/modernjs/ {
  proxy_pass http://devmeetings.github.io/devmeeting-modernjs/;
  proxy_set_header X-Real-IP $remote_addr;
}

location /slides/dm-angular2/program/ {
  return 301 /slides/dm-angular2/program-devmeeting/;
}

location /slides/dm-angular2/program-devmeeting/ {
  proxy_pass http://kapke.github.io/angular2-shop/program-devmeeting/;
  proxy_set_header X-Real-IP $remote_addr;

  # angular2 / angular2-wro / angular2-krk / angular2-waw / 5613
  auth_basic "Restricted";
  auth_basic_user_file /etc/nginx/{{ server_name }}-htpasswd;
}

location /slides/dm-angular2/ {
  proxy_pass http://kapke.github.io/angular2-shop/;
  proxy_set_header X-Real-IP $remote_addr;
}

############################################
#               EXTERNAL                   #
############################################

proxy_cache_path /var/cache/nginx/{{ server_name }}/one keys_zone={{ server_id }}one:20m;

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
  gzip_types text/plain text/html text/css application/x-javascript text/javascript;

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

