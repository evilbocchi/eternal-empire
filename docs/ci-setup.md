# Continuous Integration Setup

This project includes automated CI/CD pipelines for testing, linting, and building.

## GitHub Actions

The project uses GitHub Actions for continuous integration. The workflow runs on:
- Push to `main` branches
- Pull requests to `main` branches

### Required Secrets

To run tests in CI, you need to set up these repository secrets in GitHub:

1. Go to your repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `LUAU_EXECUTION_API_KEY`: Your Roblox Cloud API key
   - `LUAU_EXECUTION_UNIVERSE_ID`: Your Roblox universe ID
   - `LUAU_EXECUTION_PLACE_ID`: Your Roblox place ID

### CI Jobs

The workflow includes three jobs:

1. **test**: Runs linting, building, testing, and documentation generation
2. **security**: Performs security audits and checks for outdated packages
3. **release**: Creates a GitHub release containing transpiled Luau code