#!/bin/bash

# Check CloudFront deployment status
echo "==================================="
echo "Oddiya Front Deployment Status Check"
echo "==================================="
echo ""

# CloudFront Distribution
echo "📡 CloudFront Distribution:"
CF_STATUS=$(aws cloudfront get-distribution --id E1YQCU2TNJ1IIF --query 'Distribution.Status' --output text)
echo "   ID: E1YQCU2TNJ1IIF"
echo "   Status: $CF_STATUS"
echo "   URL: https://d2dl9p7inrij8.cloudfront.net"
echo ""

# Backend ALB Health
echo "🔧 Backend Service:"
echo "   ALB: http://oddiya-alb-56303406.ap-northeast-2.elb.amazonaws.com"
echo -n "   Health Check: "
curl -s -o /dev/null -w "%{http_code}" http://oddiya-alb-56303406.ap-northeast-2.elb.amazonaws.com/v1/health || echo "Failed"
echo ""
echo ""

# S3 Bucket
echo "📦 S3 Bucket:"
echo "   Name: oddiya-front-static"
echo -n "   Objects: "
aws s3 ls s3://oddiya-front-static/ --recursive --summarize | grep "Total Objects" | cut -d: -f2
echo ""

# Test Frontend (if deployed)
if [ "$CF_STATUS" == "Deployed" ]; then
    echo "🌐 Frontend Test:"
    echo -n "   CloudFront Response: "
    curl -s -o /dev/null -w "%{http_code}" https://d2dl9p7inrij8.cloudfront.net/ || echo "Failed"
    echo ""
else
    echo "⏳ CloudFront is still deploying. This usually takes 15-20 minutes."
    echo "   Run this script again in a few minutes to check status."
fi

echo ""
echo "==================================="
echo "To invalidate CloudFront cache after updates:"
echo "aws cloudfront create-invalidation --distribution-id E1YQCU2TNJ1IIF --paths '/*'"
echo "===================================="