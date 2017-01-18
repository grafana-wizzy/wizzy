# How can you contribute to the project?
wizzy is always open for contributions from the community. Let's make it super easy to use Grafana via CLI!

## Setup Development environment:

- Install nodejs v5.10.1+.

- Fork https://github.com/utkarshcmu/wizzy.

- Clone your fork and run following commands:
```
$ git clone https://github.com/<your_github_username>/wizzy.git
$ cd wizzy
$ npm install
$ npm install -g grunt-cli
$ node src/index.js init
```

- Test linting before submitting the PR:
$ grunt

- Run wizzy commands via index.js:
```
$ node src/index.js help
```

- To connect your wizzy dev environment to Grafana, please follow the steps in https://github.com/utkarshcmu/wizzy/blob/master/README.md. Also, replace `wizzy` with `node src/index.js` to run the commands for local testing.

- Enjoy developing wizzy.
