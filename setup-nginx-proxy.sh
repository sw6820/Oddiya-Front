#!/bin/bash

# Setup NGINX as HTTPS proxy for video API

ssh -o StrictHostKeyChecking=no -i ../PycharmProjects/oddiya/oddiya-db-key.pem ubuntu@43.201.84.175 << 'EOF'
# Install NGINX
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Configure NGINX as reverse proxy
sudo tee /etc/nginx/sites-available/video-api <<NGINX
server {
    listen 80;
    server_name 43.201.84.175;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
NGINX

# Enable the site
sudo ln -sf /etc/nginx/sites-available/video-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "NGINX proxy configured on port 80"
EOF

# Update security group to allow port 80
aws ec2 authorize-security-group-ingress \
    --group-id sg-098225fef0040871f \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region ap-northeast-2 || echo "Port 80 already open"

echo "✅ NGINX proxy is now running on http://43.201.84.175"