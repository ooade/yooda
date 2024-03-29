<p align="center">
  <h1 align="center">Yooda</h1>
  <p align="center"><img src="https://raw.githubusercontent.com/ooade/yooda/master/yoda.svg?sanitize=true" alt="" width="200px" /></p>
  <p align="center">"Do or do not. There is no try." - Yoda</p>
  <p align="center">🧘‍♂️600b validation library with custom handlers and messages.</p>
  <p align="center">
  <a href="https://www.npmjs.org/package/yooda"><img src="https://img.shields.io/npm/v/yooda.svg?style=flat-square" alt="npm"></a>
  <a href="https://travis-ci.org/ooade/yooda"><img src="https://img.shields.io/travis/ooade/yooda.svg?style=flat-square" alt="travis"></a>
  <a href="https://github.com/ooade/yooda"><img src="https://img.shields.io/npm/dm/yooda.svg?style=flat-square" alt="downloads/month"></a>
  <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PR(s)-welcome-brightgreen.svg?style=flat-square" alt="pullrequest"></a>
  <a href="http://www.firsttimersonly.com"><img src="https://img.shields.io/badge/first--timers--only-friendly-blue.svg?style=flat-square" alt="firsttimersonly"></a>
  </p>
</p>

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Extras](#extras)
  - [Domain](#domain)
  - [Custom Error Messages](#custom-error-messages)

### Installation

```sh
npm add yooda
```

### Basic Usage

```js
import validator from "yooda";

const requestBodySchema = {
	name: {
		type: "string",
		required: true
	},
	age: {
		type: "number",
		required: true
	}
};

const requestBody = {
	name: "Ademola Adegbuyi",
	age: 23
};

try {
	const validate = validator(requestBodySchema);
	validate(requestBody);
} catch (err) {
	res.status(500).send(err);
}
```

That's it, really. If the value doesn't meet the requirement, it throws an error and you can handle it as you want.

### Extras

#### Domain

This is more like a plugin, to ensure some other personal requirements are met asides from the regular "required" and "type". We definitely cannot offer a way to solve all kinds of edge-cases so we're giving you a buffet; Be your own boss, control the nature of the validation.

Here's how to use it:

```js
const shouldStartWithA = value => value.startsWith("a");
// attach it to your schema
const requestBodySchema = {
	name: {
		type: "string",
		required: true,
		domain: [shouldStartWithA]
	}
};
const validate = validator(requestBodySchema);
validate(requestBody);
```

The convention you decide to pick is up to you. The one used in the example above is a function that is used on the fly. You could just create an object of domains as done in the test file. You could also have them in a separate file and import only the ones needed.

#### Custom Error Messages

You could define how errors will be thrown based on the supported error types (requiredError, typeError, and domainError), and it's very easy to use! A short example:

```ts
const schema: Schema = {
	age: {
		type: "number",
		required: true,
		domain: [domains.IS_POSITIVE]
	}
};

const customErrorHandlers: CustomErrorHandlers = {
	domainError: ({ value, domain }) =>
		`${value} doesn't satify the ${domain} requirement`
};

const validate = validator(schema, customErrorHandlers);
```

**Props available to the error types:**

Note that: only the props required will be suggested to you via intellisense 🙏

```ts
type RequiredErrorProps = {
	key: string;
};

type TypeErrorProps = {
	key: string;
	type: string;
	value: any;
};

type DomainErrorProps = {
	key: string;
	type: string;
	value: any;
	domain: string;
};
```

## LICENSE

MIT
