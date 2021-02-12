#! /bin/sh
# Script to run muttle web application, should be run ONLY from the project root.
# Commands:
#  - install: Installs all dependencies via yarn for both frontend/backend.
#  - build: Generates build artifacts for frontend/backend.
#    - frontend: Uses react-scripts build to generate optimized static assets.
#    - backend: Transpiles Typescript to Javscript and type declarations (not currently used, server
#      instead uses ts-node).
# - run: Runs the application. May be used in development mode to enable live reloads on backend/
#   frontend applications.
# - clean: Remove build artifacts and node modules.
# - clean-install: Performs a clean install of node_modules for backend/frontend
#    applications.
# - help: Print help message.

# TODO - Design a more robust method of determining package root (currrently reliant on running from
#  the package root). Possibly replace shell script completely.
PACKAGE_ROOT=$(pwd)
FRONTEND="${PACKAGE_ROOT}/frontend"
BACKEND="${PACKAGE_ROOT}/backend"
DB_SETUP="${PACKAGE_ROOT}/scripts/db-setup.sql"

COMMAND=""
DEVELOPMENT=false
BUILD=true
HELP=false
ARGS=()

set -e

db_setup() {
  if [ "$1" = "" ]
  then
    echo "muttle db-setup <admin> [password]"
  elif [ "$2" = "" ]
  then
    set -x
    mysql -u $1 < "$DB_SETUP"
  else
    set -x
    mysql -u $1 -p $2 < "$DB_SETUP"
  fi
}

install() {
	yarn run install-all
}

build() {
  install
	yarn run build
}

run() {
  if [ ${DEVELOPMENT} = true ]
  then
    yarn run start-dev
  else
    if [ ${BUILD} = true ]
    then
      build
    fi
    yarn run start
  fi
}

clean() {
  yarn run clean
}

clean_install() {
	yarn run clean-install
}

help() {
  echo "Usage: muttle <command> [--dev | -D | --no-build]"
  echo
  echo "Where <command> is one of:"
  echo "  run, build, install, clean, clean-install"
  echo ""
  echo "For the run command, optionally specify one of the following options:"
  echo "  --dev | -D: Run the application in development mode, with live reloads"
  echo "              on changes to the frontend/backend applications. Frontend is"
  echo "              accessible via the port used by react-scripts start (3001)."
  echo "  --no-build: Run the application, skipping the build and install steps."
  echo "              Note the development option supersedes this and already skips"
  echo "              the build/install steps."
  exit 0
}

while [ $# -gt 0 ]
do
key="$1"
case $key in
  -D|--dev)
    DEVELOPMENT=true
    shift
    ;;
  -h|-H|--help|help)
    HELP=true
    shift
    ;;
  --no-build)
    BUILD=false
    shift
    ;;
  *)
    if [ "$COMMAND" = "" ]
    then
      COMMAND="$1"
    else
      ARGS+=("$1")
    fi
    shift
    ;;
esac
done

if [ ${HELP} = true ]
then
  help
fi

case "$COMMAND" in
  install)
    install
    ;;
  run)
    run
    ;;
  build)
    set -x
    build
    ;;
  clean)
    set -x
    clean
    ;;
  clean-install)
    set -x
    clean_install
    ;;
  db-setup)
    db_setup ${ARGS[@]}
    ;;
  "")
    help
    ;;
  *)
    echo "Unrecognized command: ${COMMAND}"
    echo
    help
    exit 1
    ;;
esac
