#!/bin/bash

# Create CloudFront distribution for Video API to enable HTTPS

echo "Creating CloudFront distribution for Video API..."

# Create CloudFront distribution configuration
cat > /tmp/video-api-cloudfront.json <<EOF
{
  "CallerReference": "video-api-$(date +%s)",
  "Comment": "Oddiya Video API - Remotion Server",
  "DefaultRootObject": "",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "video-api-ec2",
        "DomainName": "43.201.84.175",
        "CustomOriginConfig": {
          "HTTPPort": 3001,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": {
            "Quantity": 3,
            "Items": ["TLSv1", "TLSv1.1", "TLSv1.2"]
          },
          "OriginReadTimeout": 30,
          "OriginKeepaliveTimeout": 5
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "video-api-ec2",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
    "OriginRequestPolicyId": "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100",
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": true
  },
  "HttpVersion": "http2and3"
}
EOF

# Create the distribution
RESULT=$(aws cloudfront create-distribution --distribution-config file:///tmp/video-api-cloudfront.json --output json)
DIST_ID=$(echo "$RESULT" | jq -r '.Distribution.Id')
DOMAIN_NAME=$(echo "$RESULT" | jq -r '.Distribution.DomainName')

echo "✅ CloudFront distribution created for Video API"
echo "Distribution ID: $DIST_ID"
echo "Domain Name: https://$DOMAIN_NAME"
echo ""
echo "⏳ Note: It will take 15-20 minutes for the distribution to be deployed."
echo ""
echo "Next steps:"
echo "1. Wait for distribution to be deployed"
echo "2. Update frontend .env.production with: NEXT_PUBLIC_VIDEO_API_URL=https://$DOMAIN_NAME"
echo "3. Rebuild and redeploy frontend"

# Save configuration
cat > video-api-cloudfront-info.txt <<EOF
Video API CloudFront Configuration
===================================
Distribution ID: $DIST_ID
CloudFront URL: https://$DOMAIN_NAME
Origin: http://43.201.84.175:3001
Status: Deploying (15-20 minutes)

To check status:
aws cloudfront get-distribution --id $DIST_ID --query 'Distribution.Status'

To update frontend:
Edit .env.production:
NEXT_PUBLIC_VIDEO_API_URL=https://$DOMAIN_NAME
EOF

cat video-api-cloudfront-info.txt