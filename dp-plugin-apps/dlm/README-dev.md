# Dataplane

* Follow the instructions in this [README](https://github.com/hortonworks/dataplane/blob/master/README-dev.md) to setup Dataplane in dev mode (run services natively without docker containers)
* **Do not start** DP web server 

# DLM

* Edit `<dataplane>/dp-plugin-apps/dlm/dlm-app/conf/routes` and modify the following lines
  ```
  GET      /                                                        controllers.StaticAssets.at(path="/usr/local/etc/nginx/servers/dlm-web", file="index.html")
  GET     /dlm/*file                                                controllers.StaticAssets.at(path="/usr/local/etc/nginx/servers/dlm-web", file)
  GET     /*file                                                    controllers.StaticAssets.at(path="/usr/local/etc/nginx/servers/dlm-web", file)
  ```
* Follow the instructions in this [README](https://github.com/hortonworks/dataplane/tree/master/dp-plugin-apps/dlm) to run dlmApp service.
* **Do not start** DLM web server.

# Setup Nginx

* Setup Nginx server in local dev environment
  ## Mac
  
  * `brew install nginx` 
  * `brew services start nginx` to auto start nginx at login
  * Edit nginx conf - Default path is `/usr/local/etc/nginx/nginx.conf`. In this conf `localhost:8762` is where the zuul service is running. 
      
      ```
      #user  nobody;
      worker_processes  auto;

      error_log  logs/error.log;
      error_log  logs/error.log  notice;
      error_log  logs/error.log  info;

      pid        logs/nginx.pid;


      events {
          worker_connections  1024;
      }


      http {

          # Hide nginx version information.
          server_tokens off;

          # Specify MIME types for files.
          include       mime.types;
          default_type  application/octet-stream;

          # Update charset_types to match updated mime.types.
          # text/html is always included by charset module.
          charset_types text/css text/plain text/vnd.wap.wml application/javascript application/json application/rss+xml application/xml;

          # Include $http_x_forwarded_for within default format used in log files
          log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                              '$status $body_bytes_sent "$http_referer" '
                              '"$http_user_agent" "$http_x_forwarded_for"';

          # Log access to this file
          # This is only used when you don't override it on a server{} level
          access_log /var/log/nginx/access.log main;

          # How long to allow each connection to stay idle.
          # Longer values are better for each individual client, particularly for SSL,
          # but means that worker connections are tied up longer.
          keepalive_timeout 20s;

          # Speed up file transfers by using sendfile() to copy directly
          # between descriptors rather than using read()/write().
          # For performance reasons, on FreeBSD systems w/ ZFS
          # this option should be disabled as ZFS's ARC caches
          # frequently used files in RAM by default.
          sendfile        on;

          # Don't send out partial frames; this increases throughput
          # since TCP frames are filled up before being sent out.
          tcp_nopush      on;

          # Enable gzip compression.
          gzip on;

          # Compression level (1-9).
          # 5 is a perfect compromise between size and CPU usage, offering about
          # 75% reduction for most ASCII files (almost identical to level 9).
          gzip_comp_level    5;

          # Don't compress anything that's already small and unlikely to shrink much
          # if at all (the default is 20 bytes, which is bad as that usually leads to
          # larger files after gzipping).
          gzip_min_length    256;

          # Compress data even for clients that are connecting to us via proxies,
          # identified by the "Via" header (required for CloudFront).
          gzip_proxied       any;

          # Tell proxies to cache both the gzipped and regular version of a resource
          # whenever the client's Accept-Encoding capabilities header varies;
          # Avoids the issue where a non-gzip capable client (which is extremely rare
          # today) would display gibberish if their proxy gave them the gzipped version.
          gzip_vary          on;

          # Compress all output labeled with one of the following MIME-types.
          gzip_types
              application/atom+xml
              application/javascript
              application/json
              application/ld+json
              application/manifest+json
              application/rss+xml
              application/vnd.geo+json
              application/vnd.ms-fontobject
              application/x-font-ttf
              application/x-web-app-manifest+json
              application/xhtml+xml
              application/xml
              font/opentype
              image/bmp
              image/svg+xml
              image/x-icon
              text/cache-manifest
              text/css
              text/plain
              text/vcard
              text/vnd.rim.location.xloc
              text/vtt
              text/x-component
              text/x-cross-domain-policy;
          # text/html is always compressed by gzip module

          # This should be turned on if you are going to have pre-compressed copies (.gz) of
          # static files available. If not it should be left off as it will cause extra I/O
          # for the check. It is best if you enable this in a location{} block for
          # a specific directory, or on an individual server{} level.
          # gzip_static on;

          # Include files in the sites-enabled folder. server{} configuration files should be
          # placed in the sites-available folder, and then the configuration should be enabled
          # by creating a symlink to it in the sites-enabled folder.
          # See doc/sites-enabled.md for more info.
          # include sites-enabled/*;
          
          server {
              listen       80;
              # server_name  $hostname;

              # charset koi8-r;

              location / {
                  index index.html;
                  root /usr/local/etc/nginx/servers/dp-web;
                  try_files $uri $uri/ /index.html;
              }

              # /api/ and /auth/ have been kept seperate as we assume that they would be served by different backends later
              location /api/ {
                  proxy_set_header X-Forwarded-Host $host;
                  proxy_set_header X-Forwarded-Server $host;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_pass http://localhost:8762/api/app/api/;
              }

              location /auth/ {
                  proxy_set_header X-Forwarded-Host $host;
                  proxy_set_header X-Forwarded-Server $host;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_pass http://localhost:8762/api/app/auth/;
              }

              location /login/ {
                  proxy_set_header X-Forwarded-Host $host;
                  proxy_set_header X-Forwarded-Server $host;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_pass http://localhost:8762/api/app/login;

              }

              location /dlm/ {
                  proxy_set_header X-Forwarded-Host $host;
                  proxy_set_header X-Forwarded-Server $host;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_pass http://localhost:9011/;
              }

          }
      }
  * Build dp-web and dlm-web
    * `yarn run build`
  * Copy `dist` folder of dp-web into `/usr/local/etc/nginx/servers/dp-web`
  * Copy `dist` folder of dlm-web into `/usr/local/etc/nginx/servers/dlm-web` 
  * Start nginx
    * `sudo nginx`
    * If nginx is already started, reload nginx conf by `sudo nginx -s reload`

Now modify `/etc/hosts` file to add an entry `127.0.0.1   dataplane` and point your browser to http://dataplane/

# Known Issues

* Trying to load `/dlm/` via zuul doesn't work
* Hot Module Replacement doesn't work since nginx complains of permissions issues if a soft link is created to the source path.
    
