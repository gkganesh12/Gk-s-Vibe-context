#!/bin/bash

# Branch Protection Setup Script for Vibe Context
# This script sets up branch protection rules for the main branch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🛡️  Setting up branch protection for main branch...${NC}\n"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed.${NC}"
    echo -e "${YELLOW}Install it from: https://cli.github.com/${NC}"
    echo -e "${YELLOW}Or use the GitHub UI setup guide: .github/BRANCH-PROTECTION-SETUP.md${NC}"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
    echo -e "${YELLOW}Running: gh auth login${NC}"
    gh auth login
fi

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo -e "${GREEN}Repository: ${REPO}${NC}\n"

# Set branch protection rules
echo -e "${GREEN}Configuring branch protection rules...${NC}"

gh api repos/${REPO}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["compile","test"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"restrict_dismissals":false}' \
  --field restrictions=null \
  --field required_linear_history=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_conversation_resolution=true

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Branch protection rules configured successfully!${NC}\n"
    echo -e "${GREEN}Protection rules applied:${NC}"
    echo -e "  ✅ Require PR before merging"
    echo -e "  ✅ Require 1 approval"
    echo -e "  ✅ Require status checks (compile, test)"
    echo -e "  ✅ Require linear history"
    echo -e "  ✅ Block force pushes"
    echo -e "  ✅ Block deletions"
    echo -e "  ✅ Require conversation resolution"
    echo -e "  ✅ Include administrators"
else
    echo -e "\n${RED}❌ Failed to configure branch protection${NC}"
    echo -e "${YELLOW}You may need admin access to the repository${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 Branch protection setup complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Set up GitHub Actions workflows (see .github/workflows/)"
echo -e "  2. Verify protection by trying to push directly to main (should fail)"
echo -e "  3. Test with a PR (should require approval)"

