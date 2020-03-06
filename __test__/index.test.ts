import test from 'tape';
import validator, { CustomErrorHandlers, Schema } from '../src';

const domains = {
	IS_INTEGER: (value: number) => Number.isInteger(value),
	IS_POSITIVE: (value: number) => domains.IS_INTEGER && value > 0
};

test('should not throw error with the right data types and schema', t => {
	const schema: Schema = {
		age: {
			type: 'number',
			required: true
		},
		height: {
			type: 'number'
		}
	};

	const validate = validator(schema);
	t.doesNotThrow(() => validate({ age: 2, height: 3 }));
	t.end();
});

test("should throw error when a required data isn't supplied", t => {
	const schema: Schema = {
		age: {
			type: 'number',
			required: true
		},
		height: {
			type: 'number'
		}
	};

	try {
		const validate = validator(schema);
		validate({ height: 3 });
	} catch (err) {
		t.equal(err.message, 'age is required', 'returns the right message');
	}
	t.end();
});

test("should throw error when a value does not meet one of the domain's requirement", t => {
	const schema: Schema = {
		age: {
			type: 'number',
			required: true,
			domain: [domains.IS_POSITIVE]
		},
		height: {
			type: 'number'
		}
	};

	try {
		const validate = validator(schema);
		validate({ age: -3 });
	} catch (err) {
		t.equal(
			err.message,
			'-3 does not satisfy the domain IS_POSITIVE',
			'returns the right message'
		);
	}
	t.end();
});

test('should use custom required error message', t => {
	const schema: Schema = {
		age: {
			type: 'number',
			required: true,
			domain: [domains.IS_POSITIVE]
		},
		height: {
			type: 'number'
		}
	};

	const CustomErrorHandlers: CustomErrorHandlers = {
		requiredError: ({ key }) => `You need to pass the required value for ${key}`
	};

	try {
		const validate = validator(schema, CustomErrorHandlers);
		validate({ height: 2 });
	} catch (err) {
		t.equal(
			err.message,
			'You need to pass the required value for age',
			'returns the right message'
		);
	}
	t.end();
});

test('should use custom type error message', t => {
	const schema: Schema = {
		age: {
			type: 'number',
			required: true
		},
		height: {
			type: 'number'
		}
	};

	const CustomErrorHandlers: CustomErrorHandlers = {
		typeError: ({ value, type }) =>
			`You passed the wrong type (${type}) with value (${value})`
	};

	try {
		const validate = validator(schema, CustomErrorHandlers);
		validate({ age: '12', height: 2 });
	} catch (err) {
		t.equal(
			err.message,
			'You passed the wrong type (number) with value ("12")',
			'returns the right message'
		);
	}
	t.end();
});

test('should use custom domain error message', t => {
	const schema: Schema = {
		age: {
			type: 'number',
			required: true,
			domain: [domains.IS_POSITIVE]
		},
		height: {
			type: 'number'
		}
	};

	const CustomErrorHandlers: CustomErrorHandlers = {
		domainError: ({ value, domain }) =>
			`${value} doesn't satify the ${domain} requirement`
	};

	try {
		const validate = validator(schema, CustomErrorHandlers);
		validate({ age: -1, height: 2 });
	} catch (err) {
		t.equal(
			err.message,
			"-1 doesn't satify the IS_POSITIVE requirement",
			'returns the right message'
		);
	}
	t.end();
});
