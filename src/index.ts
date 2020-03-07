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
			const { type, domain } = schema[key];

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

			if (domain && typeOf(domain) !== "array") {
				throw new Error(`The domain set on ${key} is expected to be an array`);
			}

			if (domain) {
				domain.forEach(currentDomain => {
					if (!currentDomain(value)) {
						throw new Error(
							customErrorHandlers?.domainError
								? customErrorHandlers.domainError({
										key,
										value: JSON.stringify(value),
										domain: currentDomain.name
								  })
								: `${value} assigned to ${key} does not satisfy the ${currentDomain.name} domain`
						);
					}
				});
			}

			target[key] = value;
			return true;
		}
	};

	return (data: Data) => {
		const proxy = new Proxy({}, handler);

		if (!(schema && typeOf(schema) === "object")) {
			throw new Error("Schema object not found!");
		}

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

		return proxy;
	};
};

export default validator;
