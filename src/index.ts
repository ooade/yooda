import typeOf from "micro-typeof";

type CustomErrorHandler<K> = (props: K) => string;

type TypeErrorProps = {
	key: string;
	type: string;
	value: any;
};

type DomainErrorProps = {
	key: string;
	value: any;
	domain: string;
};

type SchemaBody = {
	type: string;
	required?: boolean;
	domain?: ((value: any) => boolean)[];
};

interface Data {
	[key: string]: unknown;
}

export interface Schema {
	[key: string]: SchemaBody;
}

export type CustomErrorHandlers = {
	requiredError?: CustomErrorHandler<{ key: string }>;
	typeError?: CustomErrorHandler<TypeErrorProps>;
	domainError?: CustomErrorHandler<DomainErrorProps>;
};

const validator = (
	schema: Schema,
	customErrorHandlers?: CustomErrorHandlers
) => {
	const handler: ProxyHandler<Data> = {
		set(target, key: string, value: any) {
			const targetSchema = schema[key];

			// Can't trap without a schema
			if (!targetSchema) return true;

			const type = targetSchema.type;
			const domainArr = targetSchema.domain;

			if (typeOf(value) !== type) {
				throw new TypeError(
					customErrorHandlers?.typeError
						? customErrorHandlers.typeError({
								key,
								type,
								value: JSON.stringify(value)
						  })
						: `${key} is expected to be of type "${type}"`
				);
			}

			if (domainArr && typeOf(domainArr) !== "array") {
				throw new Error(`The domain set on ${key} is expected to be an array`);
			}

			if (domainArr) {
				domainArr.forEach(domain => {
					if (!domain(value)) {
						throw new Error(
							customErrorHandlers?.domainError
								? customErrorHandlers.domainError({
										key,
										value: JSON.stringify(value),
										domain: domain.name
								  })
								: `${value} assigned to ${key} does not satisfy the ${domain.name} domain`
						);
					}
				});
			}

			return true;
		}
	};

	return (data: Data): void => {
		const proxy = new Proxy({}, handler);

		Object.keys(schema).forEach(key => {
			const required = schema[key].required;

			if (required && !data[key]) {
				throw new Error(
					customErrorHandlers?.requiredError
						? customErrorHandlers.requiredError({ key })
						: `${key} is required`
				);
			}
		});

		Object.keys(data).forEach(key => {
			proxy[key] = data[key];
		});
	};
};

export default validator;
