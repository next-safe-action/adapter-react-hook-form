"use client";

import type { ValidationErrors } from "next-safe-action";
import type { Infer, InferIn, Schema } from "next-safe-action/adapters/types";
import type { HookBaseUtils, HookCallbacks, HookSafeActionFn } from "next-safe-action/hooks";
import { useAction, useOptimisticAction } from "next-safe-action/hooks";
import * as React from "react";
import type { Resolver, UseFormProps } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { ErrorMapperProps } from "./index";
import { mapToHookFormErrors } from "./index";

/**
 * Optional props for `useHookFormAction` and `useHookFormOptimisticAction`.
 */
export type HookProps<ServerError, S extends Schema, BAS extends readonly Schema[], CVE, CBAVE, Data> = {
	errorMapProps?: ErrorMapperProps;
	actionProps?: HookBaseUtils<S> & HookCallbacks<ServerError, S, BAS, CVE, CBAVE, Data>;
	formProps?: Omit<UseFormProps<Infer<S>, any>, "resolver">;
};

/**
 * For more advanced use cases where you want full customization of the hooks used, you can
 * use this hook to map a validation errors object to a `FieldErrors` compatible with react-hook-form.
 * You can then pass the returned `hookFormValidationErrors` property to `useForm`'s `errors` prop.
 *
 * @param validationErrors Validation errors object from `next-safe-action`
 * @returns Object of `FieldErrors` compatible with react-hook-form
 */
export function useHookFormActionErrorMapper<S extends Schema>(
	validationErrors: ValidationErrors<S> | undefined,
	props?: ErrorMapperProps
) {
	const hookFormValidationErrors = React.useMemo(
		() => mapToHookFormErrors<S>(validationErrors, props),
		[validationErrors, props]
	);

	return {
		hookFormValidationErrors,
	};
}

/**
 * This hook is a wrapper around `useAction` and `useForm` that makes it easier to use safe actions
 * with react-hook-form. It also maps validation errors to `FieldErrors` compatible with react-hook-form.
 *
 * @param safeAction The safe action
 * @param hookFormResolver A react-hook-form validation resolver
 * @param props Optional props for both `useAction`, `useForm` hooks and error mapper
 * @returns An object containing `action` and `form` controllers, `handleActionSubmit`, and `resetFormAndAction`
 */
export function useHookFormAction<ServerError, S extends Schema, BAS extends readonly Schema[], CVE, CBAVE, Data>(
	safeAction: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, Data>,
	hookFormResolver: Resolver<Infer<S>, any>,
	props?: HookProps<ServerError, S, BAS, CVE, CBAVE, Data>
) {
	const action = useAction(safeAction, props?.actionProps);

	const { hookFormValidationErrors } = useHookFormActionErrorMapper<S>(
		action.result.validationErrors as ValidationErrors<S> | undefined,
		props?.errorMapProps
	);

	const form = useForm<Infer<S>>({
		...props?.formProps,
		resolver: hookFormResolver,
		errors: hookFormValidationErrors,
	});

	const handleSubmitWithAction = form.handleSubmit(action.executeAsync);

	const resetFormAndAction = () => {
		form.reset();
		action.reset();
	};

	return {
		action,
		form,
		handleSubmitWithAction,
		resetFormAndAction,
	};
}

/**
 * This hook is a wrapper around `useOptimisticAction` and `useForm` that makes it easier to use safe actions
 * with react-hook-form. It also maps validation errors to `FieldErrors` compatible with react-hook-form.
 *
 * @param safeAction The safe action
 * @param hookFormResolver A react-hook-form validation resolver
 * @param props Required `currentState` and `updateFn` props for the action, and additional optional
 * props for both `useAction`, `useForm` hooks and error mapper
 * @returns An object containing `action` and `form` controllers, `handleActionSubmit`, and `resetFormAndAction`
 */
export function useHookFormOptimisticAction<
	ServerError,
	S extends Schema,
	BAS extends readonly Schema[],
	CVE,
	CBAVE,
	Data,
	State,
>(
	safeAction: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, Data>,
	hookFormResolver: Resolver<Infer<S>, any>,
	props: HookProps<ServerError, S, BAS, CVE, CBAVE, Data> & {
		actionProps: {
			currentState: State;
			updateFn: (state: State, input: S extends Schema ? InferIn<S> : undefined) => State;
		};
	}
) {
	const action = useOptimisticAction(safeAction, props.actionProps);

	const { hookFormValidationErrors } = useHookFormActionErrorMapper<S>(
		action.result.validationErrors as ValidationErrors<S> | undefined,
		props.errorMapProps
	);

	const form = useForm<Infer<S>>({
		...props?.formProps,
		resolver: hookFormResolver,
		errors: hookFormValidationErrors,
	});

	const handleSubmitWithAction = form.handleSubmit(action.executeAsync);

	const resetFormAndAction = () => {
		form.reset();
		action.reset();
	};

	return {
		action,
		form,
		handleSubmitWithAction,
		resetFormAndAction,
	};
}
