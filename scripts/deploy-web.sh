#!/usr/bin/env bash
# Publie dist/ sur la branche gh-pages.
#
# Pourquoi pas le paquet `gh-pages` : il fait un `git add` classique, donc le
# .gitignore du dépôt (qui contient `node_modules/`) écarte silencieusement
# dist/assets/node_modules/** — soit toutes les polices d'icônes, qui
# s'affichent alors en carrés vides. Ici `git add -f` force l'ajout.
set -euo pipefail

cd "$(dirname "$0")/.."
BRANCH=gh-pages
WORKTREE=".gh-pages-worktree"

[ -d dist ] || { echo "dist/ absent — lance d'abord: npm run build:web"; exit 1; }
touch dist/.nojekyll   # sans ça, Jekyll ignore le dossier _expo/

cleanup() { git worktree remove --force "$WORKTREE" 2>/dev/null || true; }
trap cleanup EXIT
cleanup

git fetch -q origin "$BRANCH" 2>/dev/null || true

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git worktree add "$WORKTREE" "$BRANCH" >/dev/null
elif git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  # La branche existe sur le distant mais pas en local : on repart de son sommet
  # pour que le push reste en avance rapide.
  git worktree add -b "$BRANCH" "$WORKTREE" "origin/$BRANCH" >/dev/null
else
  git worktree add --detach "$WORKTREE" >/dev/null
  git -C "$WORKTREE" checkout --orphan "$BRANCH" >/dev/null
fi

git -C "$WORKTREE" rm -rq --ignore-unmatch . 2>/dev/null || true
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +

tar -C dist -cf - . | tar -C "$WORKTREE" -xf -

git -C "$WORKTREE" add -f -A
if git -C "$WORKTREE" diff --cached --quiet; then
  echo "Aucun changement à publier."
else
  git -C "$WORKTREE" commit -qm "Déploiement web $(date -u +%Y-%m-%dT%H:%M:%SZ)"
fi
git -C "$WORKTREE" push -q origin "$BRANCH"

echo "✅ Publié — $(git -C "$WORKTREE" ls-files | wc -l | tr -d ' ') fichiers sur $BRANCH"
