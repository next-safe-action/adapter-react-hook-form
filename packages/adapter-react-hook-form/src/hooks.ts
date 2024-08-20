"use client";

import type { ValidationErrors } from "next-safe-action";
import type { Infer, InferIn, Schema } from "next-safe-action/adapters/types";
import type { HookSafeActionFn } from "next-safe-action/hooks";
import { useAction, useOptimisticAction } from "next-safe-action/hooks";
import * as React from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import type {} from "zod";
import type { HookProps, UseHookFormActionHookReturn, UseHookFormOptimisticActionHookReturn } from "./hooks.types";
import type { ErrorMapperProps } from "./index";
import { mapToHookFormErrors } from "./index";

/**
 * For more advanced use cases where you want full customization of the hooks used, you can
 * use this hook to map a validation errors object to a `FieldErrors` compatible with react-hook-form.
 * You can then pass the returned `hookFormValidationErrors` property to `useForm`'s `errors` prop.
 *
 * @param validationErrors Validation errors object from `next-safe-action`
 * @returns Object of `FieldErrors` compatible with react-hook-form
 */
export function useHookFormActionErrorMapper<S extends Schema | undefined>(
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
export function useHookFormAction<
	ServerError,
	S extends Schema | undefined,
	BAS extends readonly Schema[],
	CVE,
	CBAVE,
	Data,
	FormContext = any,
>(
	safeAction: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, Data>,
	hookFormResolver: Resolver<S extends Schema ? Infer<S> : any, FormContext>,
	props?: HookProps<ServerError, S, BAS, CVE, CBAVE, Data, FormContext>
): UseHookFormActionHookReturn<ServerError, S, BAS, CVE, CBAVE, Data, FormContext> {
	const action = useAction(safeAction, props?.actionProps);

	const { hookFormValidationErrors } = useHookFormActionErrorMapper<S>(
		action.result.validationErrors as ValidationErrors<S> | undefined,
		props?.errorMapProps
	);

	const form = useForm<S extends Schema ? Infer<S> : any, FormContext>({
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
	S extends Schema | undefined,
	BAS extends readonly Schema[],
	CVE,
	CBAVE,
	Data,
	State,
	FormContext = any,
>(
	safeAction: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, Data>,
	hookFormResolver: Resolver<S extends Schema ? Infer<S> : any, FormContext>,
	props: HookProps<ServerError, S, BAS, CVE, CBAVE, Data, FormContext> & {
		actionProps: {
			currentState: State;
			updateFn: (state: State, input: S extends Schema ? InferIn<S> : undefined) => State;
		};
	}
): UseHookFormOptimisticActionHookReturn<ServerError, S, BAS, CVE, CBAVE, Data, State, FormContext> {
	const action = useOptimisticAction(safeAction, props.actionProps);

	const { hookFormValidationErrors } = useHookFormActionErrorMapper<S>(
		action.result.validationErrors as ValidationErrors<S> | undefined,
		props.errorMapProps
	);

	const form = useForm<S extends Schema ? Infer<S> : any, FormContext>({
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

export * from "./hooks.types";
