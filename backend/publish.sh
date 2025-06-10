if [ -z "$1" ]; then
    echo "Error: Version argument is required (e.g. 0.0.1)" >&2
    exit 1
fi

./build-image.sh
docker tag nft-studio:latest apillonio/nft-studio:$1
docker push apillonio/nft-studio:$1