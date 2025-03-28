set -e

docker build -t nft-studio . 
docker tag nft-studio nft-studio:latest