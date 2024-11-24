echo "Getting dependencies"
echo
node ./scripts/get-deps.js
echo
chmod +x ./scripts/installdeps.sh
./scripts/installdeps.sh
echo
rm ./scripts/installdeps.sh
