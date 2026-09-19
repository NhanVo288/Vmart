#!/usr/bin/env bash
set -Eeuo pipefail

release=${1:?Usage: deploy-ec2.sh RELEASE REPOSITORY SHA}
repository=${2:?Missing repository}
sha=${3:?Missing commit SHA}
[[ "$release" =~ ^[a-f0-9]{40}-[0-9]+-[0-9]+$ ]] || exit 2
[[ "$repository" =~ ^[a-z0-9_.-]+/[a-z0-9_.-]+$ ]] || exit 2
[[ "$sha" =~ ^[a-f0-9]{40}$ ]] || exit 2

deploy_root="$HOME/Vmart"
cd "$deploy_root/releases/$release"
test -s "$deploy_root/.env" || { echo "Missing $deploy_root/.env" >&2; exit 1; }
# Also serialize manual deployments on the server.
exec 9>"$deploy_root/deploy.lock"
flock -w 600 9
export API_IMAGE="ghcr.io/$repository-api:$sha"
export FRONTEND_IMAGE="ghcr.io/$repository-frontend:$sha"
compose=(docker compose --project-name restore-system --env-file "$deploy_root/.env"
  -f docker-compose.prod.yml -f docker-compose.ec2.yml)

"${compose[@]}" config --quiet
# Pull before touching running containers. Registry login is provisioned on EC2.
"${compose[@]}" pull api frontend
trap 'echo "Deployment failed; inspect containers and the previous release before retrying." >&2; "${compose[@]}" ps' ERR
"${compose[@]}" up -d --no-build --wait --wait-timeout 300 sql redis elasticsearch
# Recreate Nginx together with API so its upstream DNS uses the new API address.
"${compose[@]}" up -d --no-build --no-deps --force-recreate \
  --wait --wait-timeout 360 api frontend

printf 'API_IMAGE=%s\nFRONTEND_IMAGE=%s\n' "$API_IMAGE" "$FRONTEND_IMAGE" > images.env
if [[ -L "$deploy_root/current" ]]; then
  readlink "$deploy_root/current" > "$deploy_root/previous-release"
fi
ln -sfn "$PWD" "$deploy_root/current"
echo "Deployed $sha successfully."
