#!/bin/bash

# Jenkins Installation Script
# This script installs Jenkins on Ubuntu/Debian systems

set -e  # Exit on error

echo "=========================================="
echo "Jenkins Installation Script"
echo "=========================================="

# Remove problematic repositories
echo "Cleaning problematic repositories..."
rm -f /etc/apt/sources.list.d/monarx.list
rm -f /etc/apt/sources.list.d/jenkins.list
rm -f /usr/share/keyrings/jenkins-keyring.asc

# Update package list
echo "Updating package list..."
apt-get update || true  # Continue even if some repos fail

# Install Java 21 (required for Jenkins 2.426.1+)
echo "Installing Java 21..."
apt-get install -y openjdk-21-jdk openjdk-21-jre curl

# Verify Java installation
echo "Verifying Java installation..."
java --version

# Add Jenkins repository key (new method)
echo "Adding Jenkins repository key..."
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | \
  gpg --dearmor -o /usr/share/keyrings/jenkins-keyring.gpg

# Add Jenkins repository to sources list
echo "Adding Jenkins repository..."
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.gpg] https://pkg.jenkins.io/debian-stable binary/" | \
  tee /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package list again
echo "Updating package list with Jenkins repository..."
apt-get update

# Install Jenkins
echo "Installing Jenkins..."
apt-get install -y jenkins

# Configure Jenkins to run on port 8888
echo "Configuring Jenkins to run on port 8888..."
sed -i 's/HTTP_PORT=8080/HTTP_PORT=8888/g' /etc/default/jenkins

# For systemd-based systems (Ubuntu 20.04+)
if [ -f /lib/systemd/system/jenkins.service ]; then
    mkdir -p /etc/systemd/system/jenkins.service.d
    cat > /etc/systemd/system/jenkins.service.d/override.conf <<EOF
[Service]
Environment="JENKINS_PORT=8888"
EOF
    systemctl daemon-reload
fi

# Start Jenkins service
echo "Starting Jenkins service..."
systemctl start jenkins
systemctl enable jenkins

# Wait for Jenkins to start
echo "Waiting for Jenkins to initialize..."
sleep 15

# Get Jenkins status
echo "Checking Jenkins status..."
systemctl status jenkins --no-pager || true

# Configure firewall (if UFW is active)
if command -v ufw &> /dev/null; then
    echo "Configuring firewall..."
    ufw allow 8888/tcp
    echo "Firewall rule added for port 8888"
fi

# Get initial admin password
echo ""
echo "=========================================="
echo "Jenkins Installation Complete!"
echo "=========================================="
echo ""
echo "Access Jenkins at: http://your-server-ip:8888"
echo ""
echo "Initial Admin Password:"
if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
    cat /var/lib/jenkins/secrets/initialAdminPassword
else
    echo "Password file not found. Jenkins may still be initializing."
    echo "Run this command to get the password:"
    echo "  sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
fi
echo ""
echo "=========================================="
