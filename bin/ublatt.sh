#!/bin/bash

if ! command -v pandoc &> /dev/null
then
    echo "pandoc could not be found"
    exit
fi
if ! command -v npx &> /dev/null
then
    echo "npx (from node.js) could not be found"
    exit
fi

UBLATT_HOME="$(npm ls ublatt -p -g)"

for i in "$@"
do
case $i in
    --solution=*)
    SOLUTION="${i#*=}"
    shift # past argument=value
    ;;    
    *)
          # unknown option
    ;;
esac
done

if test -r $PWD/course.yaml
then
  OPTIONS+="--metadata-file=$PWD/course.yaml"
fi

if [ ${SOLUTION+x} ];
then  
  OPTIONS+="--metadata-file=$SOLUTION"
fi

OPTIONS+=("--from=markdown+bracketed_spans")
OPTIONS+=("--to=html5")
OPTIONS+=("--template=$UBLATT_HOME/templates/ublatt.html")
OPTIONS+=("--standalone")
OPTIONS+=("--self-contained")
OPTIONS+=("--resource-path=$PWD:$UBLATT_HOME/dist:$UBLATT_HOME")
OPTIONS+=("--number-sections")
OPTIONS+=("--section-divs")
OPTIONS+=("--filter $UBLATT_HOME/filters/ublatt-filter.js")
OPTIONS+=("--lua-filter $UBLATT_HOME/filters/ublatt.lua")
OPTIONS+=("--metadata=ublatt_home:$UBLATT_HOME")


pandoc ${OPTIONS[@]} $@