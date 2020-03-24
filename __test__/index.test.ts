import test from "tape";
import yooda, { CustomErrorHandlers, Schema } from "../src";

const domains = {
	IS_INTEGER: (value: number) => Number.isInteger(value),
	IS_POSITIVE: (value: number) => domains.IS_INTEGER && value > 0
};

enum schemaKeys {
	ageRequired = "ageRequired",
	ageRequiredAndHeight = "ageRequiredAndHeight",
	ageStringTransformRequired = "ageStringTransformRequired",
	agePositiveDomainRequiredAndHeight = "agePositiveDomainRequiredAndHeight"
}

type Schemas = {
	[key in schemaKeys]: Schema;
};

const schemas: Schemas = {
	ageRequired: {
		age: {
			type: "number",
			required: true
		}
	},
	ageStringTransformRequired: {
		age: {
			type: "string",
			required: true,
			transform: value => parseInt(value, 10)
		}
	},
	ageRequiredAndHeight: {
		age: {
			type: "number",
			required: true
		},
		height: {
			type: "number"
		}
	},
	agePositiveDomainRequiredAndHeight: {
		age: {
			type: "number",
			required: true,
			domain: [domains.IS_POSITIVE]
		},
		height: {
			type: "number"
		}
	}
};

test("should not throw error with the right data types and schema", t => {
	const validate = yooda(schemas.ageRequiredAndHeight);
	t.doesNotThrow(() => validate({ age: 2, height: 3 }));
	t.end();
});

test("should throw error when a required data isn't supplied", t => {
	try {
		const validate = yooda(schemas.ageRequiredAndHeight);
		validate({ height: 3 });
	} catch (err) {
		t.equal(err.message, "age is required", "returns the right message");
	}
	t.end();
});

test("should throw error when a required data type isn't supplied", t => {
	try {
		const validate = yooda(schemas.ageRequired);
		validate({ age: "3" });
	} catch (err) {
		t.equal(
			err.message,
			`age is expected to be of type "number"`,
			"returns the right message"
		);
	}
	t.end();
});

test("should throw error when a value does not meet one of the domain's requirement", t => {
	try {
		const validate = yooda(schemas.agePositiveDomainRequiredAndHeight);
		validate({ age: -3 });
	} catch (err) {
		t.equal(
			err.message,
			"-3 assigned to age does not satisfy the IS_POSITIVE domain",
			"returns the right message"
		);
	}
	t.end();
});

test("should use custom required error message", t => {
	const CustomErrorHandlers: CustomErrorHandlers = {
		requiredError: ({ key }) => `You need to pass the required value for ${key}`
	};

	try {
		const validate = yooda(
			schemas.agePositiveDomainRequiredAndHeight,
			CustomErrorHandlers
		);
		validate({ height: 2 });
	} catch (err) {
		t.equal(
			err.message,
			"You need to pass the required value for age",
			"returns the right message"
		);
	}
	t.end();
});

test("should use custom type error message", t => {
	const CustomErrorHandlers: CustomErrorHandlers = {
		typeError: ({ value, type }) =>
			`You passed the wrong type (${type}) with value (${value})`
	};

	try {
		const validate = yooda(schemas.ageRequiredAndHeight, CustomErrorHandlers);
		validate({ age: "12", height: 2 });
	} catch (err) {
		t.equal(
			err.message,
			'You passed the wrong type (number) with value ("12")',
			"returns the right message"
		);
	}
	t.end();
});

test("should use custom domain error message", t => {
	const CustomErrorHandlers: CustomErrorHandlers = {
		domainError: ({ value, domain }) =>
			`${value} doesn't satify the ${domain} requirement`
	};

	try {
		const validate = yooda(
			schemas.agePositiveDomainRequiredAndHeight,
			CustomErrorHandlers
		);
		validate({ age: -1, height: 2 });
	} catch (err) {
		t.equal(
			err.message,
			"-1 doesn't satify the IS_POSITIVE requirement",
			"returns the right message"
		);
	}
	t.end();
});

test("should throw an error if the domain is not an array", t => {
	const schema: Schema = {
		age: {
			type: "number",
			required: true,
			// @ts-ignore
			domain: {}
		}
	};

	try {
		const validate = yooda(schema);
		validate({ age: 10 });
	} catch (err) {
		t.equal(
			err.message,
			"The domain set on age is expected to be an array",
			"returns the right message"
		);
	}
	t.end();
});

test("should throw an error if one of the domains isn't a function", t => {
	const schema: Schema = {
		age: {
			type: "number",
			required: true,
			// @ts-ignore
			domain: [{}]
		}
	};

	try {
		const validate = yooda(schema);
		validate({ age: 2 });
	} catch (err) {
		t.equal(
			err.message,
			"currentDomain is not a function",
			"returns the right message"
		);
	}
	t.end();
});

test("should throw an error if no schema is passed", t => {
	try {
		// @ts-ignore
		const validate = yooda();
		validate({ age: 2 });
	} catch (err) {
		t.equal(
			err.message,
			"Schema object not found!",
			"returns the right message"
		);
	}
	t.end();
});

test("should return back the validated data", t => {
	const validate = yooda(schemas.ageRequiredAndHeight);
	const validated = validate({ age: 3, height: 4.5 });

	t.equal(validated.age, 3);
	t.equal(validated.height, 4.5);
	t.end();
});

test("should transform values if needed", t => {
	const validate = yooda(schemas.ageStringTransformRequired);
	let value = { age: "3" };
	const validated = validate(value);

	t.equal(validated.age, 3);
	t.equal(value.age, "3");
	t.end();
});
