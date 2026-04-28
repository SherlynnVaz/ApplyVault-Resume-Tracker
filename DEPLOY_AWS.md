# AWS Deployment Guide

This guide deploys:
- Frontend to S3 (manual-friendly)
- Backend Express API to Lambda + API Gateway (via SAM)
- MySQL database on RDS
- Event notifications with SNS

## 1) Prerequisites

Install and configure:
- AWS CLI v2
- AWS SAM CLI
- Node.js 20+
- MySQL client (`mysql`) for schema migration

Check tools:

```bash
aws --version
sam --version
node --version
mysql --version
```

Configure AWS credentials:

```bash
aws configure
```

## 2) Backend Deploy (Lambda + API Gateway + RDS + SNS)

Copy deploy env template and edit values:

```bash
cp deploy/aws/.env.deploy.example deploy/aws/.env.deploy
```

Run the deploy script:

```bash
chmod +x deploy/aws/deploy_backend.sh
./deploy/aws/deploy_backend.sh
```

What the script does:
- Creates SNS topic
- Creates resume S3 bucket and public-read policy for uploaded resumes
- Creates RDS MySQL instance (publicly accessible demo setup)
- Builds and deploys backend Lambda + API Gateway with SAM
- Prints API URL, SNS topic ARN, and RDS endpoint

Apply schema to RDS after deploy (use values printed by script):

```bash
mysql -h <RDS_HOST> -u <DB_USER> -p <DB_NAME> < sql/schema.sql
```

## 3) Frontend Deploy to S3 (manual)

Set frontend API URL to your deployed API Gateway URL:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` and set:
- `VITE_API_BASE_URL=https://<api-id>.execute-api.<region>.amazonaws.com/prod/api`
- `VITE_UPLOADS_BASE_URL=https://<resume-bucket>.s3.<region>.amazonaws.com`

Build frontend:

```bash
npm install
npm run build
```

Create website bucket:

```bash
aws s3 mb s3://<your-frontend-bucket-name>
aws s3 website s3://<your-frontend-bucket-name> --index-document index.html --error-document index.html
```

Allow public reads and SPA routing support:

```bash
aws s3api put-public-access-block \
  --bucket <your-frontend-bucket-name> \
  --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

aws s3api put-bucket-policy \
  --bucket <your-frontend-bucket-name> \
  --policy '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":["s3:GetObject"],"Resource":["arn:aws:s3:::<your-frontend-bucket-name>/*"]}]}'
```

Upload built frontend:

```bash
aws s3 sync dist s3://<your-frontend-bucket-name> --delete
```

### Troubleshooting: `/login` (and other routes) returns 404 on S3

The frontend uses React Router's `BrowserRouter` (clean URLs like `/login`).
On a static S3 website, a direct refresh/navigation to `/login` makes S3 look for an object named `login`.
If it doesn't exist, S3 returns **404** unless Website Hosting is configured to fall back to `index.html`.

Fix (recommended for S3 Website Hosting):

```bash
aws s3 website s3://<your-frontend-bucket-name> \
  --index-document index.html \
  --error-document index.html
```

Verify:

```bash
aws s3api get-bucket-website --bucket <your-frontend-bucket-name>
```

Note: Even with `--error-document index.html`, S3 Website Hosting can still respond with a **404 status**
for deep links while serving the SPA HTML. The app will work, but DevTools may still show a 404 for the
document request. If you need **HTTP 200** for SPA routes, put CloudFront in front and configure a custom
error response (404 -> `/index.html` with 200).

## 4) Useful AWS Commands

Get API URL from CloudFormation outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name applyvault-prod-backend \
  --query 'Stacks[0].Outputs[?OutputKey==`HttpApiUrl`].OutputValue' \
  --output text
```

Subscribe email to SNS topic:

```bash
aws sns subscribe \
  --topic-arn <topic-arn> \
  --protocol email \
  --notification-endpoint you@example.com
```

Tail Lambda logs:

```bash
aws logs tail /aws/lambda/applyvault-backend-prod --follow
```

## 5) Current App Behavior in AWS

- Resume uploads are stored in S3 when `RESUME_STORAGE=s3`
- App publishes SNS messages for:
  - `application_submitted`
  - `application_status_updated`
- Backend uses MySQL in production (`DB_CLIENT=mysql`)

## 6) Security Notes

The included deploy script is intentionally simple and uses a public RDS setup for quick deployment.
For production hardening, move Lambda and RDS into private subnets and use NAT or VPC endpoints, and restrict security group ingress.
