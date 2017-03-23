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

location /static {
  root /srv/{{ server_name }}/;
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

