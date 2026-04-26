#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

ENV_FILE="${1:-$SCRIPT_DIR/.env.deploy}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE"
  echo "Copy $SCRIPT_DIR/.env.deploy.example to $SCRIPT_DIR/.env.deploy and fill values."
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

required_vars=(
  AWS_REGION
  APP_NAME
  STAGE
  FRONTEND_ORIGIN
  DB_NAME
  DB_USER
  DB_PASSWORD
  DB_INSTANCE_CLASS
  DB_ALLOCATED_STORAGE
  JWT_SECRET
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required variable: $var_name"
    exit 1
  fi
done

export AWS_REGION
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
TOPIC_NAME="${APP_NAME}-${STAGE}-events"
TOPIC_ARN="$(aws sns create-topic --name "$TOPIC_NAME" --query TopicArn --output text)"

RESUME_BUCKET="${RESUME_BUCKET:-${APP_NAME}-${STAGE}-resumes-${ACCOUNT_ID}}"
DB_IDENTIFIER="${DB_IDENTIFIER:-${APP_NAME}-${STAGE}-db}"
DB_SUBNET_GROUP="${DB_SUBNET_GROUP:-${APP_NAME}-${STAGE}-db-subnets}"
DB_SG_NAME="${DB_SG_NAME:-${APP_NAME}-${STAGE}-db-sg}"

echo "SNS topic: $TOPIC_ARN"
echo "Resume bucket: $RESUME_BUCKET"

if [[ "$AWS_REGION" == "us-east-1" ]]; then
  aws s3api create-bucket --bucket "$RESUME_BUCKET" >/dev/null 2>&1 || true
else
  aws s3api create-bucket \
    --bucket "$RESUME_BUCKET" \
    --create-bucket-configuration LocationConstraint="$AWS_REGION" >/dev/null 2>&1 || true
fi

aws s3api put-bucket-cors \
  --bucket "$RESUME_BUCKET" \
  --cors-configuration '{"CORSRules":[{"AllowedHeaders":["*"],"AllowedMethods":["GET","PUT","POST"],"AllowedOrigins":["*"],"ExposeHeaders":["ETag"]}]}'

aws s3api put-public-access-block \
  --bucket "$RESUME_BUCKET" \
  --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

aws s3api put-bucket-policy \
  --bucket "$RESUME_BUCKET" \
  --policy "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"PublicRead\",\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::$RESUME_BUCKET/*\"]}]}"

VPC_ID="$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text)"
if [[ "$VPC_ID" == "None" || -z "$VPC_ID" ]]; then
  echo "No default VPC found. Create VPC resources first, then update this script."
  exit 1
fi

SUBNET_IDS=(
"subnet-0670dcbe4698802aa"
"subnet-02faea171ed0b5959"
)

aws rds create-db-subnet-group \
  --db-subnet-group-name "$DB_SUBNET_GROUP" \
  --db-subnet-group-description "${APP_NAME} ${STAGE} db subnet group" \
  --subnet-ids "${SUBNET_IDS[@]}" >/dev/null 2>&1 || true

DB_SG_ID="$(aws ec2 describe-security-groups --filters Name=group-name,Values="$DB_SG_NAME" Name=vpc-id,Values="$VPC_ID" --query 'SecurityGroups[0].GroupId' --output text)"
if [[ "$DB_SG_ID" == "None" || -z "$DB_SG_ID" ]]; then
  DB_SG_ID="$(aws ec2 create-security-group --group-name "$DB_SG_NAME" --description "${APP_NAME} ${STAGE} db security group" --vpc-id "$VPC_ID" --query GroupId --output text)"
fi

aws ec2 authorize-security-group-ingress \
  --group-id "$DB_SG_ID" \
  --ip-permissions 'IpProtocol=tcp,FromPort=3306,ToPort=3306,IpRanges=[{CidrIp=0.0.0.0/0,Description="Demo access - tighten for production"}]' >/dev/null 2>&1 || true

DB_EXISTS="$(aws rds describe-db-instances --db-instance-identifier "$DB_IDENTIFIER" --query 'DBInstances[0].DBInstanceIdentifier' --output text 2>/dev/null || true)"
if [[ -z "$DB_EXISTS" || "$DB_EXISTS" == "None" ]]; then
  aws rds create-db-instance \
    --db-instance-identifier "$DB_IDENTIFIER" \
    --engine mysql \
    --db-instance-class "$DB_INSTANCE_CLASS" \
    --allocated-storage "$DB_ALLOCATED_STORAGE" \
    --master-username "$DB_USER" \
    --master-user-password "$DB_PASSWORD" \
    --db-name "$DB_NAME" \
    --vpc-security-group-ids "$DB_SG_ID" \
    --db-subnet-group-name "$DB_SUBNET_GROUP" \
    --publicly-accessible \
    --backup-retention-period 0 \
    --storage-type gp3
fi

aws rds wait db-instance-available --db-instance-identifier "$DB_IDENTIFIER"
DB_HOST="$(aws rds describe-db-instances --db-instance-identifier "$DB_IDENTIFIER" --query 'DBInstances[0].Endpoint.Address' --output text)"

pushd "$BACKEND_DIR" >/dev/null
npm install
sam build
sam deploy \
  --stack-name "${APP_NAME}-${STAGE}-backend" \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --region "$AWS_REGION" \
  --parameter-overrides \
    AppName="$APP_NAME" \
    StageName="$STAGE" \
    FrontendOrigin="$FRONTEND_ORIGIN" \
    DbHost="$DB_HOST" \
    DbPort=3306 \
    DbName="$DB_NAME" \
    DbUser="$DB_USER" \
    DbPassword="$DB_PASSWORD" \
    JwtSecret="$JWT_SECRET" \
    SnsTopicArn="$TOPIC_ARN" \
    ResumeBucketName="$RESUME_BUCKET" \
    ResumePublicBaseUrl="https://${RESUME_BUCKET}.s3.${AWS_REGION}.amazonaws.com"
popd >/dev/null

API_URL="$(aws cloudformation describe-stacks --stack-name "${APP_NAME}-${STAGE}-backend" --query 'Stacks[0].Outputs[?OutputKey==`HttpApiUrl`].OutputValue' --output text)"

echo
echo "Deployment complete"
echo "API URL: $API_URL"
echo "SNS topic ARN: $TOPIC_ARN"
echo "RDS host: $DB_HOST"
echo
echo "Run schema migration with:"
echo "mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < $PROJECT_ROOT/sql/schema.sql"
