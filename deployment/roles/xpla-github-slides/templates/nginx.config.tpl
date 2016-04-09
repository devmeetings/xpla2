upstream gh_{{ server_id }} {
  server localhost:{{ gh_server_port}};
  keepalive 32;
}

server {
  listen 80;
  server_name git.{{ server_name }};

  location / {
    proxy_pass http://gh_{{ server_id }};
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
