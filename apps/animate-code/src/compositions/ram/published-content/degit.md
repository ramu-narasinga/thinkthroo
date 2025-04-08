## !!steps

!duration 100

```jsx ! a
// !callout[/degit/] degit makes copies of git repositories. When you run degit some-user/some-repo, it will find the latest commit on https://github.com/some-user/some-repo and download the associated tar file to ~/.degit/some-user/some-repo/commithash.tar.gz if it doesn't already exist locally. (This is much quicker than using git clone, because you're not downloading the entire git history.)
npm install -g degit
```

## !!steps

!duration 100

```jsx ! b
// !callout[/degit/] The simplest use of degit is to download the master branch of a repo from GitHub to the current working directory 
degit user/repo

// these commands are equivalent
degit github:user/repo
degit git@github.com:user/repo
degit https://github.com/user/repo
```

## !!steps

!duration 100

```jsx ! c
// !callout[/degit/] Degit usage in Javascript. Import 'degit' at the top of your file
const degit = require('degit');

const emitter = degit('user/repo', {
	cache: true,
	force: true,
	verbose: true,
});

emitter.on('info', info => {
	console.log(info.message);
});

// !callout[/clone/] Use clone to download the latest commit to the destination folder
emitter.clone('path/to/dest').then(() => {
	console.log('done');
});
```