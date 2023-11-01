# Installation and Run instructions
1. Enter the repository, and type `yarn`
2. to run dev: `yarn run dev`
3. to run prod: `yarn run build && yarn run deploy`

# Build and Deploy with Docker
1. run `yarn run docker`. This builds the docker image and deploys it, exposing the app on port 80.

To build the docker image, you can run `yarn run buildDocker`
and you can run `yarn run deployDocker` to deploy without building

# Running Test Suite 
1. `python3 test/run_tests.py`


