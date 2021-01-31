#! /bin/sh
# Script to run muttle web application, should be run from the project root.

PACKAGE_ROOT="$HOME/workplace/CSER/muttle"
FRONTEND="${PACKAGE_ROOT}/frontend"
BACKEND="${PACKAGE_ROOT}/backend"

COMMAND=""
DEVELOPMENT=false
BUILD=true
HELP=false

set -e

install() {
	cd "${FRONTEND}" && npm install
	cd "${BACKEND}" && npm install
}

build() {
  install
	cd "${FRONTEND}" && npm run build
	cd "${BACKEND}" && npm run build
}

run() {
  if [ ${DEVELOPMENT} = true ]
  then
    set -x
    (cd "${FRONTEND}" && npm run start-dev) & (cd "${BACKEND}" && npm run start-dev) && fg
  else
    set -x
    if [ ${BUILD} = true ]
    then
      build
    fi
    cd "${BACKEND}" && npm run start
  fi
}

clean() {
	cd "${FRONTEND}" && npm run clean && rm -rf node_modules/
	cd "${BACKEND}" && npm run clean && rm -rf node_modules/
}

clean_install() {
	cd "${FRONTEND}" && npm clean-install
	cd "${BACKEND}" && npm clean-install
}

help() {
  echo "Usage: muttle <command> [--dev]"
  echo
  echo "Where <command> is one of:"
  echo "  run, build, install, clean, clean-install"
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
  -h|--help)
    HELP=true
    shift
    ;;
  --no-build)
    BUILD=false
    shift
    ;;
  *)
    COMMAND="$1"
    shift
    ;;
esac
done

if [ ${HELP} = true ]
then
  help
fi

case "$COMMAND" in
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
  "")
    help
    ;;
  *)
    echo "Unrecognized command: ${COMMAND}"
    exit 1
    ;;
esac
