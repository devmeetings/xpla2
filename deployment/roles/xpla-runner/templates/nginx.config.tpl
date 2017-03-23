upstream {{ server_id }} {
  server localhost:{{server_port}};
  keepalive 32;
}

upstream presence.{{ server_id }} {
  server localhost:{{presence_port}};
  keepalive 32;
}

server {
  listen  443 ssl http2;
  server_name presence.{{server_name}};

  ssl on;
  ssl_certificate /etc/letsencrypt/live/{{server_name}}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/{{server_name}}/privkey.pem;

  include xpla/presence.{{server_name}}.config;

  location /nginx_status {
    # copied from http://blog.kovyrin.net/2006/04/29/monitoring-nginx-with-rrdtool/
    stub_status on;
    access_log   off;
  }
}

server {
  listen  443 ssl http2;
  server_name {{server_name}} *.{{server_name}};

  ssl on;
  ssl_certificate /etc/letsencrypt/live/{{server_name}}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/{{server_name}}/privkey.pem;

  include xpla/{{server_name}}.config;

  location /nginx_status {
    # copied from http://blog.kovyrin.net/2006/04/29/monitoring-nginx-with-rrdtool/
    stub_status on;
    access_log   off;
  }
}

server {
  listen 80;
  server_name {{ server_name }};

  include xpla/{{server_name}}.config;

  # Let's encrypt
  location ~ /.well-known {
    allow all;
    root /srv/xpla.org/static/;
  }

  location /nginx_status {
    # copied from http://blog.kovyrin.net/2006/04/29/monitoring-nginx-with-rrdtool/
    stub_status on;
    access_log   off;
  }
}
