./build-image.sh
# TODO: we should probably properly version docker images
docker tag nft-studio:latest apillon/nft-studio:latest
docker push apillon/nft-studio:latest