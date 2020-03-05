import test from 'tape';
import validator from '../src';

const domains = {
	IS_INTEGER: (value: number) => Number.isInteger(value),
	IS_POSITIVE: (value: number) => domains.IS_INTEGER && value > 0
};

test('should not throw error with the right data types and schema', t => {
	const schema = {
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
	const schema = {
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
	const schema = {
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
