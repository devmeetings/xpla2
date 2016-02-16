upstream {{ server_id }} {
  server localhost:{{server_port}};
  keepalive 32;
}

server {
  listen 80;
  server_name {{ server_name }};

  location /slides/react-redux/ {
    proxy_pass https://wkwiatek.github.io/devmeeting-react-todoapp;
    proxy_set_header Host      $host;
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

  #error_page 502 /offline.html;
  #location = /offline.html {
  #  root /srv/{{ server_name }}/;
  #}

  location /nginx_status {
    # copied from http://blog.kovyrin.net/2006/04/29/monitoring-nginx-with-rrdtool/
    stub_status on;
    access_log   off;
  }
}
