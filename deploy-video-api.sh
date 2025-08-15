#!/bin/bash

# Deploy Video API Server to the same EC2 instance as PostgreSQL

echo "Deploying Video API Server to EC2..."

# Copy files to EC2
scp -o StrictHostKeyChecking=no -i oddiya-db-key.pem video-api-server.js .env.production package.json ubuntu@43.201.84.175:/home/ubuntu/

# Install and run the server
ssh -o StrictHostKeyChecking=no -i oddiya-db-key.pem ubuntu@43.201.84.175 << 'EOF'
# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 for process management
sudo npm install -g pm2

# Install dependencies
cd /home/ubuntu
npm install express cors dotenv @remotion/lambda

# Start the video API server with PM2
pm2 stop video-api || true
PORT=3001 pm2 start video-api-server.js --name video-api
pm2 save
pm2 startup | grep sudo | bash

echo "Video API Server deployed and running on port 3001"
EOF

echo "Video API Server deployed!"
echo "Updating security group to allow port 3001..."

# Allow port 3001 in security group
aws ec2 authorize-security-group-ingress \
    --group-id sg-098225fef0040871f \
    --protocol tcp \
    --port 3001 \
    --cidr 0.0.0.0/0 \
    --region ap-northeast-2 || echo "Port 3001 already open"

echo "✅ Video API Server is now accessible at http://43.201.84.175:3001"