#!/bin/bash

# Check for the existence of the version that's about to be published on NPM. If it exists, do nothing
# If it doesn't exist, check that we're on the main branch, the working directory is clean, and the current commit
# is tagged with the requested version

if [[ $# -eq 0 ]]; then
  echo "Must specify the package to push/check."
  exit 1
fi

PACKAGE=$1
JQ_PATH=".version"

NPM_SHOW="$(npm show "$PACKAGE" version)"
NPM_LS="$(cat package.json | jq -r $JQ_PATH)"
NPM_REGISTRY="$(npm config get registry)"
SHA="$(git rev-parse HEAD)"

echo "$PACKAGE npm show: $NPM_SHOW, npm ls: $NPM_LS"

while :; do
  case "$2" in
    --otp=*)
      OTP="${2#*=}"
      ;;
    *) break
  esac
  shift
done

while :; do
  case "$3" in
    --otp=*)
      OTP="${3#*=}"
      ;;
    *) break
  esac
  shift
done

if [[ "$NPM_SHOW" != "$NPM_LS" ]]; then
  echo "Versions are not the same, (Remote = $NPM_SHOW; Local = $NPM_LS). Checking for publish eligibility."

  if [[ "$NPM_REGISTRY" = "https://registry.npmjs.org/" ]]; then
    DEVCYCLE_PROD_SLEUTH_API_TOKEN="$(aws secretsmanager get-secret-value --secret-id=DEVCYCLE_PROD_SLEUTH_API_TOKEN | jq -r .SecretString )"
    # make sure we're able to track this deployment
    if [[ -z "$DEVCYCLE_PROD_SLEUTH_API_TOKEN" ]]; then
      echo "Sleuth.io deployment tracking token not found. Aborting."
      exit 1
    fi

    # check if we're on main branch
    if [[ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]]; then
      echo "Not on main branch. Aborting."
      exit 1
    fi

    # check if working directory is clean
    if [[ -n "$(git status --porcelain)" ]]; then
      echo "Working directory is not clean. Aborting."
      exit 1
    fi

    # check if current commit is tagged with the requested version
    if [[ -z "$(git tag --points-at HEAD "$PACKAGE@$NPM_LS")" ]]; then
      echo "Current commit is not tagged with the requested version. Aborting."
      exit 1
    fi

    # check if otp is set
    if [[ -z "$OTP" ]]; then
      echo "Must specify the NPM one-time password using the --otp option."
      exit 1
    fi

    npm publish --otp=$OTP

    if [[ "$?" != 0 ]]; then
      echo "Publish failed. Aborting."
      exit 1
    fi

    curl -X POST \
      -d api_key=$DEVCYCLE_PROD_SLEUTH_API_TOKEN \
      -d environment=production \
      -d sha=$SHA https://app.sleuth.io/api/1/deployments/taplytics/js-sdks-2/register_deploy
  else
    npm publish --local
  fi
else
  echo "Versions are the same ($NPM_SHOW = $NPM_LS). Not pushing"
fi
