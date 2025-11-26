#!/bin/bash
set -e

# Update packages
apt-get update
apt-get install -y openjdk-17-jdk-headless unzip wget curl nginx

# Install Certbot for Nginx
apt-get install -y certbot python3-certbot-nginx

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Create app directory
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app

# Download backend JAR from S3
aws s3 cp s3://${artifact_bucket}/fullstack-1.0-SNAPSHOT.jar ./fullstack.jar

# Create Nginx reverse proxy configuration
cat >/etc/nginx/sites-available/backend <<EOF
server {
    listen 80;
    server_name api.codecreator127.xyz;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/backend
rm -f /etc/nginx/sites-enabled/default

systemctl restart nginx

# Start Spring Boot app (no SSL inside Spring Boot)
nohup java -jar fullstack.jar \
  --server.address=0.0.0.0 \
  --server.port=8080 \
  > /home/ubuntu/app/backend.log 2>&1 &

# Wait for Nginx to come up
sleep 10

# Obtain real Let's Encrypt certificate automatically
certbot --nginx --non-interactive --agree-tos \
  -m admin@codecreator127.xyz \
  -d api.codecreator127.xyz

# Enable auto-renew
systemctl enable certbot.timer
systemctl start certbot.timer
