if [ -z "$1" ]; then
    echo "Error: Version argument is required (e.g. 0.0.1)" >&2
    exit 1
fi

if ! [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Version must be in format X.Y.Z (e.g. 0.0.1)" >&2
    exit 1
fi


# Check if the tag already exists
if docker manifest inspect apillonio/nft-studio:$1 >/dev/null 2>&1; then
    read -p "Warning: Tag $1 already exists. Do you want to overwrite it? (y/N) " confirm
    if [[ $confirm != [yY] ]]; then
        echo "Aborting..."
        exit 1
    fi
fi


./build-image.sh
docker tag nft-studio:latest apillonio/nft-studio:$1
docker push apillonio/nft-studio:$1

# Update version in docker-compose.yml
sed -i "s|image: apillonio/nft-studio:[0-9]*\.[0-9]*\.[0-9]*|image: apillonio/nft-studio:$1|" docker-compose.yml
echo "Updated version in docker-compose.yml to $1"
