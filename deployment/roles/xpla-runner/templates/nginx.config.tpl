upstream {{ server_id }} {
  server localhost:{{server_port}};
  keepalive 32;
}

upstream presence.{{ server_id }} {
  server localhost:{{presence_port}};
  keepalive 32;
}

server {
  listen  443 ssl spdy;
  server_name presence.{{server_name}};

  ssl on;
  ssl_certificate /etc/nginx/xpla/keys/{{server_name}}.crt;
  ssl_certificate_key /etc/nginx/xpla/keys/{{server_name}}.key;

  include xpla/presence.{{server_name}}.config;

  location /nginx_status {
    # copied from http://blog.kovyrin.net/2006/04/29/monitoring-nginx-with-rrdtool/
    stub_status on;
    access_log   off;
  }
}

server {
  listen  443 ssl spdy;
  server_name {{server_name}} *.{{server_name}};

  ssl on;
  ssl_certificate /etc/nginx/xpla/keys/{{server_name}}.crt;
  ssl_certificate_key /etc/nginx/xpla/keys/{{server_name}}.key;

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

  location /nginx_status {
    # copied from http://blog.kovyrin.net/2006/04/29/monitoring-nginx-with-rrdtool/
    stub_status on;
    access_log   off;
  }
}
