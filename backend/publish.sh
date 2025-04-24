./build-image.sh
# TODO: we should probably properly version docker images
docker tag nft-studio:latest Apillon/nft-studio:latest
docker push Apillon/nft-studio:latest