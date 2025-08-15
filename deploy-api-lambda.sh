#!/bin/bash

# Deploy API Routes as Lambda Functions
# This handles the API routes that can't be included in static export

set -e

# Configuration
FUNCTION_PREFIX="oddiya-api"
REGION="us-east-1"
RUNTIME="nodejs20.x"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔧 Deploying API Routes to Lambda${NC}"

# Step 1: Create Lambda deployment package
echo -e "${YELLOW}Creating deployment package...${NC}"
mkdir -p lambda-deploy
cp -r src/pages/api/* lambda-deploy/
cp package.json lambda-deploy/
cd lambda-deploy
npm install --production
zip -r ../api-functions.zip .
cd ..
rm -rf lambda-deploy

# Step 2: Create IAM role for Lambda (if not exists)
ROLE_NAME="oddiya-lambda-role"
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    echo "Creating IAM role..."
    cat > /tmp/trust-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF
    
    ROLE_ARN=$(aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file:///tmp/trust-policy.json \
        --query 'Role.Arn' \
        --output text)
    
    # Attach basic Lambda execution policy
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # Attach S3 access for Remotion
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
    
    echo "✅ IAM role created"
    sleep 10  # Wait for role to propagate
fi

# Step 3: Deploy Lambda functions
echo -e "${YELLOW}Deploying Lambda functions...${NC}"

# Deploy render-video function
aws lambda create-function \
    --function-name "${FUNCTION_PREFIX}-render-video" \
    --runtime $RUNTIME \
    --role $ROLE_ARN \
    --handler render-video.handler \
    --zip-file fileb://api-functions.zip \
    --timeout 300 \
    --memory-size 3008 \
    --environment Variables="{
        REMOTION_AWS_ACCESS_KEY_ID=$REMOTION_AWS_ACCESS_KEY_ID,
        REMOTION_AWS_SECRET_ACCESS_KEY=$REMOTION_AWS_SECRET_ACCESS_KEY
    }" 2>/dev/null || \
aws lambda update-function-code \
    --function-name "${FUNCTION_PREFIX}-render-video" \
    --zip-file fileb://api-functions.zip

# Deploy travel-photos function
aws lambda create-function \
    --function-name "${FUNCTION_PREFIX}-travel-photos" \
    --runtime $RUNTIME \
    --role $ROLE_ARN \
    --handler travel-photos.handler \
    --zip-file fileb://api-functions.zip \
    --timeout 30 \
    --memory-size 512 2>/dev/null || \
aws lambda update-function-code \
    --function-name "${FUNCTION_PREFIX}-travel-photos" \
    --zip-file fileb://api-functions.zip

echo "✅ Lambda functions deployed"

# Step 4: Create API Gateway
echo -e "${YELLOW}Setting up API Gateway...${NC}"
API_NAME="oddiya-api"
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='$API_NAME'].ApiId" --output text)

if [ -z "$API_ID" ]; then
    API_ID=$(aws apigatewayv2 create-api \
        --name $API_NAME \
        --protocol-type HTTP \
        --cors-configuration '{
            "AllowOrigins": ["*"],
            "AllowMethods": ["GET", "POST", "OPTIONS"],
            "AllowHeaders": ["*"]
        }' \
        --query 'ApiId' \
        --output text)
    echo "✅ API Gateway created: $API_ID"
fi

# Get API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api --api-id $API_ID --query 'ApiEndpoint' --output text)

echo -e "${GREEN}✅ API Deployment Complete!${NC}"
echo "API Endpoint: $API_ENDPOINT"
echo ""
echo "Update your frontend code to use these endpoints:"
echo "- $API_ENDPOINT/render-video"
echo "- $API_ENDPOINT/travel-photos"

# Clean up
rm -f api-functions.zip