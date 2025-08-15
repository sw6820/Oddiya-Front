#!/bin/bash

# Full Stack Test Script for Oddiya

echo "======================================"
echo "Oddiya Full Stack Test"
echo "======================================"
echo ""

# Frontend (CloudFront)
echo "📱 Frontend Status:"
FRONTEND_URL="https://d2dl9p7inrij8.cloudfront.net"
echo -n "   CloudFront: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Online ($HTTP_CODE)"
else
    echo "❌ Error ($HTTP_CODE)"
fi
echo "   URL: $FRONTEND_URL"
echo ""

# Backend (ALB)
echo "🔧 Backend Status:"
BACKEND_URL="http://oddiya-alb-56303406.ap-northeast-2.elb.amazonaws.com"
echo "   ALB: $BACKEND_URL"
echo -n "   Health Check: "
# Using a shorter timeout
HEALTH_RESPONSE=$(curl -s --max-time 5 "$BACKEND_URL/v1/health" 2>/dev/null || echo "Connection failed")
if [ "$HEALTH_RESPONSE" = "Connection failed" ]; then
    echo "❌ Backend not responding"
else
    echo "✅ Backend is healthy"
    echo "   Response: $HEALTH_RESPONSE"
fi
echo ""

# Database (PostgreSQL on EC2)
echo "💾 Database Status:"
echo "   PostgreSQL EC2: 172.31.10.25"
echo "   Instance: i-005d5fe3e395761e8"
echo -n "   SSH Test: "
ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i oddiya-db-key.pem ubuntu@43.201.84.175 "echo 'Connected'" 2>/dev/null || echo "SSH connection failed"
echo ""

# ECS Service
echo "📦 ECS Service Status:"
SERVICE_INFO=$(aws ecs describe-services --cluster oddiya-cluster --services oddiya-service \
    --query 'services[0].{RunningCount:runningCount,DesiredCount:desiredCount}' --output json)
echo "   $SERVICE_INFO"
echo ""

# Recent ECS Logs
echo "📝 Recent Backend Logs:"
aws logs tail /ecs/oddiya --since 1m | grep -E "Started|ERROR|Exception" | head -5 || echo "   No recent significant logs"
echo ""

echo "======================================"
echo "Video Generation Requirements:"
echo "======================================"
echo ""
echo "✅ Frontend deployed to CloudFront"
echo "✅ PostgreSQL deployed on EC2"
echo "⚠️  Backend needs to connect to DB"
echo "⚠️  Remotion Lambda needs configuration"
echo ""
echo "Next Steps:"
echo "1. Fix backend database connection"
echo "2. Configure Remotion Lambda for video rendering"
echo "3. Test video generation from UI"
echo ""
echo "Access the app at: $FRONTEND_URL"
echo "======================================" 