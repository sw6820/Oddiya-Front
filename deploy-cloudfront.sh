#!/bin/bash

# AWS CloudFront Deployment Script for Oddiya-Front
# This script handles the complete deployment to S3 + CloudFront

set -e

# Configuration
BUCKET_NAME="oddiya-front-static"
REGION="us-east-1"  # CloudFront requires us-east-1 for some operations
DISTRIBUTION_COMMENT="Oddiya Front - Travel Memory Platform"
CF_DISTRIBUTION_ID=""  # Will be set after first deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting CloudFront Deployment Process${NC}"

# Step 1: Create S3 Bucket if it doesn't exist
echo -e "${YELLOW}Step 1: Setting up S3 bucket...${NC}"
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo "✅ Bucket $BUCKET_NAME already exists"
else
    echo "Creating bucket $BUCKET_NAME..."
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" \
        --acl private
    
    # Enable static website hosting
    aws s3api put-bucket-website \
        --bucket "$BUCKET_NAME" \
        --website-configuration '{
            "IndexDocument": {"Suffix": "index.html"},
            "ErrorDocument": {"Key": "404.html"}
        }'
    
    echo "✅ Bucket created and configured"
fi

# Step 2: Create bucket policy for CloudFront
echo -e "${YELLOW}Step 2: Configuring bucket policy...${NC}"
cat > /tmp/bucket-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontAccess",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json
echo "✅ Bucket policy configured"

# Step 3: Build Next.js application
echo -e "${YELLOW}Step 3: Building Next.js application...${NC}"
cp next.config.cloudfront.js next.config.js.backup
cp next.config.cloudfront.js next.config.js

npm run build

# Restore original config
cp next.config.js.backup next.config.js
rm next.config.js.backup

echo "✅ Application built successfully"

# Step 4: Sync files to S3
echo -e "${YELLOW}Step 4: Uploading files to S3...${NC}"
aws s3 sync out/ "s3://$BUCKET_NAME/" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "_next/static/chunks/pages/*"

# Upload HTML files with different cache settings
aws s3 sync out/ "s3://$BUCKET_NAME/" \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --exclude "*" \
    --include "*.html" \
    --include "_next/static/chunks/pages/*"

echo "✅ Files uploaded to S3"

# Step 5: Create or Update CloudFront Distribution
echo -e "${YELLOW}Step 5: Setting up CloudFront distribution...${NC}"

if [ -z "$CF_DISTRIBUTION_ID" ]; then
    echo "Creating new CloudFront distribution..."
    
    # Create CloudFront distribution configuration
    cat > /tmp/cloudfront-config.json <<EOF
{
    "CallerReference": "oddiya-front-$(date +%s)",
    "Comment": "$DISTRIBUTION_COMMENT",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BUCKET_NAME",
                "DomainName": "$BUCKET_NAME.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "MinTTL": 0,
        "Compress": true
    },
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponseCode": 200,
                "ResponsePagePath": "/index.html",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 403,
                "ResponseCode": 200,
                "ResponsePagePath": "/index.html",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100",
    "ViewerCertificate": {
        "CloudFrontDefaultCertificate": true
    }
}
EOF
    
    # Create distribution
    DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution --distribution-config file:///tmp/cloudfront-config.json)
    CF_DISTRIBUTION_ID=$(echo "$DISTRIBUTION_OUTPUT" | grep '"Id"' | head -1 | cut -d'"' -f4)
    CF_DOMAIN_NAME=$(echo "$DISTRIBUTION_OUTPUT" | grep '"DomainName"' | head -1 | cut -d'"' -f4)
    
    echo "✅ CloudFront distribution created"
    echo "Distribution ID: $CF_DISTRIBUTION_ID"
    echo "Domain Name: $CF_DOMAIN_NAME"
    
    # Save distribution ID for future deployments
    echo "CF_DISTRIBUTION_ID=$CF_DISTRIBUTION_ID" > .cloudfront-config
else
    echo "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id "$CF_DISTRIBUTION_ID" \
        --paths "/*"
    
    echo "✅ CloudFront cache invalidated"
fi

# Step 6: Create deployment info file
echo -e "${YELLOW}Step 6: Saving deployment information...${NC}"
cat > deployment-info.txt <<EOF
=================================
Oddiya Front CloudFront Deployment
=================================
Date: $(date)
Bucket: $BUCKET_NAME
Region: $REGION
Distribution ID: $CF_DISTRIBUTION_ID
CloudFront URL: https://$CF_DOMAIN_NAME

To access your application:
https://$CF_DOMAIN_NAME

Note: It may take 15-20 minutes for the CloudFront distribution to be fully deployed.

For API functionality, you'll need to:
1. Deploy Lambda functions separately
2. Update API endpoints in your frontend code
3. Configure CORS for your Lambda APIs
=================================
EOF

cat deployment-info.txt

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${YELLOW}⏰ Note: CloudFront distribution takes 15-20 minutes to propagate globally.${NC}"