<p align="center">
  <h1 align="center">Yooda</h1>
  <div align="center"><img src="https://raw.githubusercontent.com/ooade/yooda/master/yoda.svg?sanitize=true" alt="" width="200px" /></div>
  <p align="center">"Do or do not. There is no try." - Yoda</p>
  <p align="center">A tiny validation library for your app</p>
  <p align="center">
  <a href="https://www.npmjs.org/package/yooda"><img src="https://img.shields.io/npm/v/yooda.svg?style=flat-square" alt="npm"></a>
  <a href="https://travis-ci.org/ooade/yooda"><img src="https://img.shields.io/travis/ooade/yooda.svg?style=flat-square" alt="travis"></a>
  <a href="https://github.com/ooade/yooda"><img src="https://img.shields.io/npm/dm/yooda.svg?style=flat-square" alt="downloads/month"></a>
  <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PR(s)-welcome-brightgreen.svg?style=flat-square" alt="pullrequest"></a>
  <a href="http://www.firsttimersonly.com"><img src="https://img.shields.io/badge/first--timers--only-friendly-blue.svg?style=flat-square" alt="firsttimersonly"></a>
  </p>
</p>

## Installation

```sh
npm add yooda
```

## Basic Usage

```js
import validator from 'yooda;

const requestBodySchema = {
	name: {
		type: 'string',
		required: true
	},
	age: {
		type: 'number',
		required: true
	}
};

const requestBody = {
	name: 'Ademola Adegbuyi',
	age: 23
};

try {
	const validate = validator(requestBodySchema);
	validate(requestBody);
} catch (err) {
	// Handle error properly
}
```

That's it, really. If the value doesn't meet the requirement, it throws an error and you can handle it as you want.

### Extras

- Domain: This is more like a plugin, to ensure some other personal requirements are met asides from the regular "required" and "type". We definitely cannot offer all kinds of edge-cases so we're giving you a buffet; Be your own boss, control the nature of the validation.

Here's how to use it:

```js
const shouldStartWithA = value => value.startsWith('a');
// attach it to your schema
const requestBodySchema = {
	name: {
		type: 'string',
		required: true,
		domain: [shouldStartWithA]
	}
};
const validate = validator(requestBodySchema);
validate(requestBody);
```

The convention you decide to pick is up to you. In the test files, we have an object of domains with camel case names. Whatever works best for you 😉

## LICENSE

MIT
