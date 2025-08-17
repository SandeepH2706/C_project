#!/bin/bash

# Prescription Management System - Google Cloud Deployment Script
echo "🚀 Starting deployment to Google Cloud..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
    echo "❌ Not logged into gcloud. Please run: gcloud auth login"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project set. Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and deploy using Cloud Build
echo "🏗️  Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml .

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at:"
gcloud run services describe prescription-app --region=us-central1 --format="value(status.url)"

echo ""
echo "📝 Next steps:"
echo "1. Visit your app URL above"
echo "2. Create an admin account (username: admin)"
echo "3. Test the prescription management features"
echo ""
echo "🔧 To view logs: gcloud run logs tail prescription-app --region=us-central1"
echo "📊 To scale: gcloud run services update prescription-app --region=us-central1 --min-instances=1 --max-instances=10"
