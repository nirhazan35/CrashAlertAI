# CircleCI CI/CD Setup for CrashAlertAI

This guide will help you set up automatic testing and deployment for your CrashAlertAI project.

## 🏗️ Project Structure
Your project has:
- **Frontend**: React app with Jest tests
- **Backend**: Node.js API with Jest tests  
- **Model Service**: Python FastAPI service with pytest

## 🚀 Quick Setup

### 1. CircleCI Account Setup
1. Go to [circleci.com](https://circleci.com) and sign up with GitHub
2. Connect your `CrashAlertAI` repository
3. CircleCI will auto-detect the config (we already created `.circleci/config.yml`)

### 2. Get Render Deploy Hooks
For each service in your Render dashboard:
1. Go to **Settings** → **Deploy Hook**
2. Copy the webhook URL (looks like: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)

### 3. Add Environment Variables in CircleCI
In your CircleCI project settings → Environment Variables:

**Required:**
- `RENDER_FRONTEND_DEPLOY_HOOK` = [Your frontend webhook URL]
- `RENDER_BACKEND_DEPLOY_HOOK` = [Your backend webhook URL]

**Optional:**
- `RENDER_MODEL_SERVICE_DEPLOY_HOOK` = [Your model service webhook URL] (if deployed)

## 🔄 Pipeline Overview

### What Happens on Every Push:
```
┌─ Frontend Tests (Jest)
├─ Backend Tests (Jest)  
└─ Model Service Tests (pytest)
```

### What Happens on Push to Main:
```
All Tests → Frontend Build → Deploy to Render
```

### Jobs Explained:
- **test-frontend**: Runs React tests with coverage
- **test-backend**: Runs Node.js API tests
- **test-model-service**: Runs Python FastAPI tests
- **build-frontend**: Creates production build
- **deploy-to-render**: Triggers Render deployments

## ⚙️ Configuration Details

### Python Dependencies Fixed
- **Issue**: Original `requirements.txt` had non-existent package versions
- **Solution**: Created `requirements-ci.txt` with compatible version ranges
- **Fallback**: If CI requirements fail, automatically relaxes version constraints

### Test Coverage
- **Frontend**: Jest with coverage reporting
- **Backend**: Standard Jest tests
- **Model Service**: Basic FastAPI endpoint tests + environment verification

## 🧪 Local Testing

Test all components:
```bash
npm run test                 # Run all tests
npm run test:frontend        # Frontend only
npm run test:backend         # Backend only
```

Test model service:
```bash
cd model-service
python test_app.py          # Direct test
pytest                      # Using pytest
```

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Python Dependency Errors
**Error**: `Could not find a version that satisfies the requirement click==8.2.0`
**Solution**: ✅ **Fixed** - We created `requirements-ci.txt` with compatible versions

#### 2. Tests Not Found
**Error**: `Did not find any tests to run`
**Solution**: ✅ **Fixed** - Created basic tests for all services

#### 3. Deploy Hooks Not Working
**Symptoms**: Deploy job succeeds but Render doesn't deploy
**Check**:
- Environment variables are set correctly in CircleCI
- Deploy hook URLs are valid and not expired
- Render services are configured for webhook deployment

#### 4. Build Failures on Main Branch Only
**Symptoms**: Tests pass but build/deploy fails
**Check**:
- Frontend build dependencies are in `package.json`
- No missing environment variables needed for build
- Render services are properly configured

### Debugging Steps

1. **Check CircleCI Logs**:
   - Go to CircleCI dashboard → Your project → Click on failed job
   - Review the detailed logs for error messages

2. **Check Render Logs**:
   - Render dashboard → Your service → Logs tab
   - Look for deployment start/failure messages

3. **Verify Environment Variables**:
   ```bash
   # In CircleCI project settings
   echo $RENDER_FRONTEND_DEPLOY_HOOK  # Should not be empty
   echo $RENDER_BACKEND_DEPLOY_HOOK   # Should not be empty
   ```

## 📈 Monitoring & Notifications

### Success Indicators:
- ✅ All tests pass
- ✅ Frontend builds successfully  
- ✅ Deploy hooks trigger Render deployments
- ✅ New code appears on your live site

### Setting Up Slack Notifications (Optional):
1. Create a Slack webhook URL
2. Add `SLACK_WEBHOOK` to CircleCI environment variables
3. The pipeline will notify on deployment success/failure

## 🔒 Security Best Practices

- ✅ Deploy hooks stored as environment variables (never in code)
- ✅ Internal secrets properly configured
- ✅ No sensitive data in public logs
- 🔄 Rotate deploy hooks periodically

## 🚀 Next Steps

Once your CI/CD is working:

1. **Add Integration Tests**: Test API endpoints with real data
2. **Performance Testing**: Monitor build and test times
3. **Security Scanning**: Add automated vulnerability checks
4. **Database Backups**: Backup before deployments
5. **Staging Environment**: Add a staging deployment step

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review CircleCI and Render logs
3. Verify environment variables are set correctly
4. Test components locally first

**Pipeline Status**: ✅ Ready for production use! 